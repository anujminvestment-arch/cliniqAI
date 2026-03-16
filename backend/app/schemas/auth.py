from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None
    clinic_name: str | None = None
    clinic_slug: str | None = None


class AuthResponse(BaseModel):
    user: dict
    membership: dict
    access_token: str
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
