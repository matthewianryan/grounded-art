# Screencast recorder

Records a showcase video of the Grounded Art web app by driving the real running app with
Playwright. The script walks the feed and its temporal views and toggles light and dark, then
saves a video to `recordings/` (git ignored).

## One-time setup

From the repo root:

```sh
pnpm install
pnpm --filter @grounded-art/screencast install-browser   # downloads the Chromium browser
```

## Record

Start the full stack first, each in its own terminal:

```sh
docker compose up -d db                                   # Postgres
cd apps/api && uv run python -m app.seed                  # seed, if not already loaded
cd apps/api && uv run uvicorn app.main:app --port 8000    # API
pnpm --filter @grounded-art/web dev                       # web app on http://localhost:3001
```

Then record:

```sh
pnpm --filter @grounded-art/screencast record
```

The video is written to `tooling/screencast/recordings/grounded-art-<timestamp>.webm`.

## Options

- `BASE_URL` — base URL of the web app including the `/app` zone prefix. Defaults to
  `http://localhost:3001/app`. Point this at a deployed URL to record the live site.
- `DEMO_SPEED` — multiplier on every pause. `DEMO_SPEED=1.5` slows the walk down, `0.7` speeds it
  up. Defaults to `1`.

## Notes

- Playwright records WebM. To produce an MP4 for sharing, convert with ffmpeg if it is installed:
  `ffmpeg -i recording.webm recording.mp4`.
- The recorder fails with a clear message if the web app is not reachable, so start the stack
  before running it.
