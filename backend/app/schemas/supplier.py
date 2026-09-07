from pydantic import BaseModel, EmailStr, ConfigDict


class SupplierCreate(BaseModel):

    name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class SupplierUpdate(BaseModel):

    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class SupplierResponse(BaseModel):

    id: int
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None

    model_config = ConfigDict(
        from_attributes = True
    )