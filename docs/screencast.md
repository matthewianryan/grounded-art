# Screencast

We keep a repeatable way to record a showcase video of the web app, so the build can be
demonstrated without manual screen capture.

The recorder lives in `tooling/screencast`. It drives the running web app with Playwright,
walking the feed and its temporal views and toggling light and dark, and saves a video to
`tooling/screencast/recordings`.

Setup and usage are in `tooling/screencast/README.md`. In short: run the stack (Postgres, the
API, and the web app), then run `pnpm --filter @grounded-art/screencast record`.

The base layer can point at a deployed URL through the `BASE_URL` variable, so the same script
records either local development or the live site.
