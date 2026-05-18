from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://ymmo:ymmo@localhost:5432/ymmo"
    SECRET_KEY: str = "changeme-use-a-strong-random-value-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    UPLOAD_DIR: str = "static/uploads"

    model_config = {"env_file": ".env"}


settings = Settings()
