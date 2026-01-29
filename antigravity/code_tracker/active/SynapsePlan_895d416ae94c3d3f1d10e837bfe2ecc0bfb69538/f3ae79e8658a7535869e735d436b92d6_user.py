Âfrom pydantic import BaseModel
from datetime import date

class UserBase(BaseModel):
    email: str
    name: str | None = None
    surname: str | None = None
    nickname: str | None = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool = False

    model_config = {
        "from_attributes": True
    }

class ContributionData(BaseModel):
    date: date
    count: int
Â"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Kfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/schemas/user.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan