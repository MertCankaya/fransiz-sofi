from collections.abc import AsyncGenerator

from api.core.config import settings
from surrealdb import AsyncSurreal


async def get_db() -> AsyncGenerator[AsyncSurreal, None]:
    db = AsyncSurreal(settings.SURREAL_URL)
    await db.connect()
    await db.signin(
        {"username": settings.SURREAL_USER, "password": settings.SURREAL_PASS}
    )
    await db.use(settings.SURREAL_NS, settings.SURREAL_DB)
    try:
        yield db
    finally:
        await db.close()
