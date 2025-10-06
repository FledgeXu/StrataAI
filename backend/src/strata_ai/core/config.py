import os


class Config:
    ORIGIN_URLS = os.getenv(
        "ORIGIN_URLS",
        "http://localhost|http://localhost:5173|http://127.0.0.1|http://127.0.0.1:5173",
    )
    DEBUG_MODE = os.getenv("DEBUG_MODE", "False").lower() == "true"
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:secret@localhost:5432/postgres",
    )
    SECRET = os.getenv(
        "SECRET",
        "SECRET",
    )
    ACCESS_TOKEN_LIFETIME_SECONDS = int(
        os.getenv(
            "ACCESS_TOKEN_LIFETIME_SECONDS",
            "3600",
        )
    )
