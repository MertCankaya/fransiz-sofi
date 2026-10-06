import bcrypt
from api.core.database import get_db
from api.features.auth.schemas import LoginRequest, LoginResponse
from fastapi import APIRouter, Depends, HTTPException, status
from surrealdb import AsyncSurreal

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSurreal = Depends(get_db)):
    users = await db.select("worker_users")

    matched_user = None
    if users:
        for u in users:
            stored_password_hash = u.get("password", "")

            # Doğrudan bcrypt ile şifre doğrulama
            is_valid = bcrypt.checkpw(
                payload.password.encode("utf-8"), stored_password_hash.encode("utf-8")
            )

            if u.get("name") == payload.username and is_valid:
                matched_user = u
                break

    if not matched_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı adı veya şifre.",
        )

    return {
        "username": matched_user.get("name"),
        "tables": matched_user.get("permission_tables", []),
        "message": "Giriş başarılı.",
    }
