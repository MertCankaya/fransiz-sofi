import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SURREAL_URL: str = os.getenv("SURREAL_URL")
    SURREAL_USER: str = os.getenv("SURREAL_USER")
    SURREAL_PASS: str = os.getenv("SURREAL_PASS")
    SURREAL_NS: str = os.getenv("SURREAL_NS")
    SURREAL_DB: str = os.getenv("SURREAL_DB")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
