from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.core.security import (hash_password,
    verify_password, create_access_token, create_refresh_token
)
from app.core.dependencies import get_current_user

from app.models.refresh_token import RefreshToken

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# ==========================================
# REGISTER
# ==========================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(
        request.password
    )

    # Validate role
    allowed_roles = [UserRole.ADMIN.value, UserRole.SALES_MANAGER.value]
    role_value = request.role.upper() if request.role else UserRole.SALES_MANAGER.value
    if role_value not in allowed_roles:
        role_value = UserRole.SALES_MANAGER.value

    # Create user
    new_user = User(
        username=request.email,
        email=request.email,
        password_hash=hashed_password,
        role=role_value,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    }
# =====================
#        LOGIN
# =====================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    # ==========================================
    # CLEAN EMAIL
    # ==========================================

    email = request.email.strip().lower()


    # ==========================================
    # FIND USER
    # ==========================================

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    # ==========================================
    # USER NOT FOUND
    # ==========================================

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


    # ==========================================
    # CHECK ACTIVE STATUS
    # ==========================================

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )


    # ==========================================
    # VERIFY PASSWORD
    # ==========================================

    password_valid = verify_password(
        request.password,
        user.password_hash
    )


    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


    # ==========================================
    # CREATE ACCESS TOKEN
    # ==========================================

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })


    # ==========================================
    # CREATE REFRESH TOKEN
    # ==========================================

    refresh_token_value = create_refresh_token()


    # ==========================================
    # REFRESH TOKEN EXPIRATION
    # ==========================================

    refresh_token_expires = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )


    # ==========================================
    # STORE REFRESH TOKEN
    # ==========================================

    refresh_token = RefreshToken(
        token=refresh_token_value,
        user_id=user.id,
        expires_at=refresh_token_expires,
        revoked=False
    )


    db.add(refresh_token)
    db.commit()


    # ==========================================
    # RETURN TOKENS
    # ==========================================

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_value,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }
# =====================
#       Refresh 
# =====================

@router.post(
    "/refresh",
    response_model=TokenResponse
)
def refresh_access_token(
    request: RefreshRequest,
    db: Session = Depends(get_db)
):

    refresh_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == request.refresh_token
        )
        .first()
    )

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    if refresh_token.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked"
        )

    if refresh_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )

    user = refresh_token.user

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }

# =====================
#        GET ME
# =====================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

# =====================
#        Logout
# =====================

@router.post("/logout")
def logout(
    request: RefreshRequest,
    db: Session = Depends(get_db)
):

    refresh_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == request.refresh_token
        )
        .first()
    )

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refresh token not found"
        )

    refresh_token.revoked = True

    db.commit()

    return {
        "message": "Logged out successfully"
    }