import bcrypt
from api.core.database import get_db
from api.features.grammar.schemas import (
    SUPPORTED_LANGUAGES,
    GrammarCreate,
    GrammarResponse,
    GrammarUpdate,
)
from api.features.grammar.service import GrammarService
from fastapi import APIRouter, Depends, Header, HTTPException, status
from surrealdb import AsyncSurreal

router = APIRouter(prefix="/grammar", tags=["Grammar"])


async def verify_table_permission(
    lang: SUPPORTED_LANGUAGES,
    x_username: str = Header(..., alias="X-Username", description="Kullanıcı Adı"),
    x_password: str = Header(..., alias="X-Password", description="Kullanıcı Şifresi"),
    db: AsyncSurreal = Depends(get_db),
) -> dict:
    """Kullanıcının kimliğini doğrular ve hedeflenen dil tablosuna erişim yetkisini teyit eder."""
    # 1. worker_users tablosundaki kullanıcıları çek
    users = await db.select("worker_users")

    matched_user = None
    if users:
        for u in users:
            stored_hash = u.get("password", "")
            # Kullanıcı adı ve bcrypt şifre doğrulaması
            if u.get("name") == x_username and bcrypt.checkpw(
                x_password.encode("utf-8"), stored_hash.encode("utf-8")
            ):
                matched_user = u
                break

    if not matched_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı adı veya şifre.",
        )

    # 2. Kullanıcının izinli tablolarını kontrol et
    target_table = f"{lang}_grammar"
    allowed_tables = matched_user.get("permission_tables", [])

    if target_table not in allowed_tables and "*" not in allowed_tables:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"'{x_username}' kullanıcısının '{target_table}' tablosuna erişim izni yok.",
        )

    return matched_user


@router.get(
    "/{lang}",
    response_model=list[GrammarResponse],
    dependencies=[Depends(verify_table_permission)],
)
async def list_grammar_topics(
    lang: SUPPORTED_LANGUAGES, db: AsyncSurreal = Depends(get_db)
):
    """Seçili dilin tablosundaki tüm konuları listeler."""
    return await GrammarService.get_all(db, lang)


@router.get(
    "/{lang}/{grammar_id}",
    response_model=GrammarResponse,
    dependencies=[Depends(verify_table_permission)],
)
async def get_grammar_topic(
    lang: SUPPORTED_LANGUAGES, grammar_id: str, db: AsyncSurreal = Depends(get_db)
):
    item = await GrammarService.get_by_id(db, lang, grammar_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{grammar_id}' kaydı {lang} tablosunda bulunamadı.",
        )
    return item


@router.post(
    "/{lang}",
    response_model=GrammarResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_table_permission)],
)
async def create_grammar_topic(
    lang: SUPPORTED_LANGUAGES,
    payload: GrammarCreate,
    db: AsyncSurreal = Depends(get_db),
):
    return await GrammarService.create(db, lang, payload)


@router.put(
    "/{lang}/{grammar_id}",
    response_model=GrammarResponse,
    dependencies=[Depends(verify_table_permission)],
)
async def update_grammar_topic(
    lang: SUPPORTED_LANGUAGES,
    grammar_id: str,
    payload: GrammarUpdate,
    db: AsyncSurreal = Depends(get_db),
):
    updated = await GrammarService.update(db, lang, grammar_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{grammar_id}' kaydı güncellenemedi veya bulunamadı.",
        )
    return updated


@router.delete(
    "/{lang}/{grammar_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_table_permission)],
)
async def delete_grammar_topic(
    lang: SUPPORTED_LANGUAGES, grammar_id: str, db: AsyncSurreal = Depends(get_db)
):
    success = await GrammarService.delete(db, lang, grammar_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{grammar_id}' kaydı silinemedi.",
        )
