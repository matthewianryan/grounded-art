from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")

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

    # Contact form notifications. The message is always stored in Postgres; Resend is used
    # only as the delivery mechanism for the internal notification.
    resend_api_key: str | None = None
    resend_api_url: str = "https://api.resend.com/emails"
    contact_notification_to: str = "hello@grounded-art.co.za"
    contact_notification_from: str = "Grounded Art <notifications@grounded-art.co.za>"
    contact_notification_reply_to_submitter: bool = True
    contact_rate_limit_ip_max: int = 5
    contact_rate_limit_ip_window_seconds: int = 900
    contact_rate_limit_email_max: int = 3
    contact_rate_limit_email_window_seconds: int = 3600
    turnstile_secret_key: str | None = None
    turnstile_siteverify_url: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    # Auth and session settings.
    session_ttl_days: int = 30
    login_code_ttl_minutes: int = 10
    login_code_pepper: str = "dev-pepper-change-in-production"
    login_code_max_attempts: int = 5
    login_code_rate_limit_per_email: int = 3
    login_code_rate_limit_window_hours: int = 1
    email_provider: str = "console"
    email_from: str = "Grounded Art <noreply@grounded-art.co.za>"
    cookie_secure: bool = False
    session_cookie_name: str = "ga-session"
    session_cookie_path: str = "/"

    # Check-in verification and wallet awards.
    check_in_radius_metres: int = 100
    check_in_challenge_ttl_minutes: int = 5
    check_in_award_window_hours: int = 24
    # A browser cannot prove its location, so presence is treated as layered evidence and the
    # award is a policy decision, not a fixed rule. See docs/wallet-and-presence.md.
    #
    # Reject a position fix coarser than this (metres). A real on-site phone fix is well under
    # it; a desktop IP-based fix is far above it. 0 or negative disables the accuracy gate.
    check_in_max_accuracy_metres: float = 250.0
    # Implausible travel between an account's consecutive check-ins withholds the point. An
    # implied speed above this (km/h) is treated as spoofing. 0 or negative disables the guard.
    check_in_max_speed_kmh: float = 150.0
    # Which presence methods earn a point, comma-separated. "geolocation" earns on a GPS fix
    # alone (the launch default, since no venue codes are deployed yet); "venue_code" requires
    # an on-site code scan. Tightening to "venue_code" later is a config change, not a rebuild.
    check_in_awarding_methods: str = "geolocation,venue_code"

    @property
    def awarding_methods(self) -> frozenset[str]:
        return frozenset(m.strip() for m in self.check_in_awarding_methods.split(",") if m.strip())

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

    @field_validator("resend_api_key", "turnstile_secret_key", mode="before")
    @classmethod
    def _empty_secret_is_none(cls, value: str | None) -> str | None:
        if isinstance(value, str) and value.strip() == "":
            return None
        return value


settings = Settings()
