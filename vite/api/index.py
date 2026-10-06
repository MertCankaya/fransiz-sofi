import sys
from pathlib import Path

# Serverless ortamda kök dizin yolunu Python path'ine güvenle ekle
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
if str(root_dir) not in sys.path:
    sys.path.append(str(root_dir))

from api.features.auth.router import router as auth_router
from api.features.grammar.router import router as grammar_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Elsine SurrealDB API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# ZİRVE DERECE GÜVENLİK: Sadece kendi domaininize ve yerel React portuna izin verin
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://app-rosy-three-73.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(grammar_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "runtime": "Vercel Serverless ASGI",
        "database": "SurrealDB",
    }
