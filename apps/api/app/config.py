from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # The default targets the local Docker Postgres. In a deployed environment the platform sets
    # DATABASE_URL; it is normalized to the psycopg driver below so a managed provider's URL works
    # without editing. Use a non-localhost host and an sslmode=require query string in production.
    database_url: str = "postgresql+psycopg://grounded:grounded@localhost:5432/grounded_art"

    # Origins allowed to call the API from a browser. Override CORS_ORIGINS with a JSON array in
    # deployed environments to allow the real web app origin.
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # When true, the redesign schema (accounts, sessions, check-ins, wallet, contact) is
    # expected to be present. No API routes use these tables until Phase 3+.
    redesign_schema_enabled: bool = True

    @field_validator("database_url")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        """Normalize the URL scheme to the psycopg driver SQLAlchemy uses.

        Managed Postgres providers hand out URLs like ``postgres://...`` or ``postgresql://...``
        with no driver. SQLAlchemy needs an explicit driver, so rewrite those to
        ``postgresql+psycopg://`` while leaving an already-qualified URL untouched.
        """
        prefixes = ("postgres://", "postgresql://")
        for prefix in prefixes:
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix) :]
        return value


settings = Settings()
