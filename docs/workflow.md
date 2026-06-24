# Workflow

How Dylan and Matthew work on Grounded Art together without stepping on each other. This is
the whole process. There is no board and no sprint. The repo and a WhatsApp thread are enough
for two people.

## Principles

- `main` is always deployable. Cloudflare Pages builds from it, so nothing lands on `main`
  that has not passed CI.
- Nobody pushes to `main` directly. All changes go through a short-lived branch and a pull
  request.
- Branches are short-lived. Open one, finish the slice of work, merge it, delete it. Aim to
  merge within a day or two so branches do not drift from `main`.
- Talk before touching shared code. A quick WhatsApp message saves a merge conflict.

## Who owns what

Ownership is clean, which is what keeps parallel work simple. Stay in your area and you will
rarely conflict.

- `apps/landing` - Dylan
- `apps/web` and `apps/api` - Matthew
- `packages/`, root config, `docs/`, CI - shared

## The loop

Every change follows the same path.

```bash
# 1. Start from a fresh main
git checkout main
git pull

# 2. Branch for the work
git checkout -b dylan/landing-copy

# 3. Work, committing as you go
git add -A
git commit -m "Realign hero copy with sharpened positioning"

# 4. Push and open a PR
git push -u origin dylan/landing-copy
```

Open the pull request on GitHub. CI runs typecheck and ruff automatically. When CI is green,
squash and merge, then delete the branch. The branch is deleted for you on merge if branch
protection is set up as below.

```bash
# 5. Back to main and clean up locally
git checkout main
git pull
git branch -d dylan/landing-copy
```

## Branch names

`yourname/short-description`, for example `matt/feed-card` or `dylan/about-page`. Lowercase,
hyphenated, no spaces.

## Staying in sync

If your branch lives longer than a day, pull `main` into it so the eventual merge is small.

```bash
git checkout main
git pull
git checkout your-branch
git merge main
```

Resolve any conflicts on your branch, not on `main`.

## Review

Review is optional, not a gate. CI is the gate. Because ownership is clean, neither of you
should have to wait on the other to merge work in your own area. GitHub will request a review
from the code owner automatically (see CODEOWNERS); treat that as a heads-up, not a blocker.
Ask for a real review when you are touching shared code or want a second pair of eyes.

## Parallel work and conflicts

Conflicts only happen where you both touch the same files. The risk zones are the shared
areas: `packages/`, root config, the CI workflow, and `pnpm-lock.yaml`.

- Before changing anything in a shared area, send a WhatsApp message so the other person
  holds off on that file until your PR lands.
- Adding or upgrading a dependency rewrites `pnpm-lock.yaml`. Do these one at a time, not in
  parallel, and merge the PR quickly to avoid lockfile conflicts.
- For the API, agree on the shape of an endpoint or model before building against it, so the
  frontend and backend do not diverge.

## One-time GitHub setup

Done once by the repo owner in GitHub settings. This is what makes `main` safe.

1. Settings > Branches > Add branch protection rule for `main`:
   - Require a pull request before merging.
   - Require status checks to pass before merging, and select the `frontend` and `api`
     checks.
   - Require branches to be up to date before merging.
2. Settings > General > Pull Requests:
   - Allow squash merging, and set it as the default.
   - Automatically delete head branches after merge.
3. Add Dylan as a collaborator with write access, and replace the placeholder handle in
   `.github/CODEOWNERS` with his GitHub username.
