from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None = None

class UserProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
