from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str
    organizationName: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenRefresh(BaseModel):
    refreshToken: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    organizationId: str
    organizationName: str

class TokenResponse(BaseModel):
    user: Optional[UserResponse] = None
    accessToken: str
    refreshToken: str
    expiresAt: datetime
