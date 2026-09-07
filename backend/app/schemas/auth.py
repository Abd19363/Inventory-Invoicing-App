from pydantic import BaseModel, EmailStr

# ==========================================
# REGISTER
# ==========================================

class RegisterRequest(BaseModel):

    email: EmailStr
    password: str
    role: str = "SALES_MANAGER"

# ==========================================
# LOGIN
# ==========================================

class LoginRequest(BaseModel):

    email: EmailStr
    password: str


# ==========================================
# TOKEN RESPONSE
# ==========================================

class TokenResponse(BaseModel):

    access_token: str
    refresh_token: str
    token_type: str
    user_id: int | None = None
    email: str | None = None
    role: str | None = None

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool

