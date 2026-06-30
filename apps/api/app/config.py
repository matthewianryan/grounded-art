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
    # expected to be present.
    redesign_schema_enabled: bool = True

    # Auth and session settings.
    session_ttl_days: int = 30
    login_code_ttl_minutes: int = 10
    login_code_pepper: str = "dev-pepper-change-in-production"
    login_code_max_attempts: int = 5
    login_code_rate_limit_per_email: int = 3
    login_code_rate_limit_window_hours: int = 1
    email_provider: str = "console"
    email_from: str = "Grounded Art <noreply@grounded-art.co.za>"
    resend_api_key: str | None = None
    cookie_secure: bool = False
    session_cookie_name: str = "ga-session"
    session_cookie_path: str = "/"

    # Check-in verification and wallet awards.
    check_in_radius_metres: int = 100
    check_in_challenge_ttl_minutes: int = 5
    check_in_award_window_hours: int = 24

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
