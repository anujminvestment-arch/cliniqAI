from pydantic import BaseModel


class StaffCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    role: str = "staff"  # staff, nurse, receptionist
    password: str


class StaffUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    role: str | None = None
    is_active: bool | None = None
