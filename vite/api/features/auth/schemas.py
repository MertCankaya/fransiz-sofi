from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Kullanıcı adı")
    password: str = Field(..., description="Kullanıcı şifresi")


class LoginResponse(BaseModel):
    username: str
    tables: list[str]
    message: str
