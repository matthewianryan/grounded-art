from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg://grounded:grounded@localhost:5432/grounded_art"
    )
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]


settings = Settings()
