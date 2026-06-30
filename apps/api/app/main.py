from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import contact, feed, galleries

app = FastAPI(title="Grounded Art API")

# The API is public and read-only. It serves no credentials or cookies, so CORS is scoped to
# the known web origins and to safe read methods rather than left open.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(contact.router)
app.include_router(galleries.router)
app.include_router(feed.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
