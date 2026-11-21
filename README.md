# wordker.app

Static site for the Wordker mobile game, served by GitHub Pages at https://wordker.app. It is maintained in
the `site/` directory of the Wordker source repository, which is the source of truth; the public repository
`shymek/wordker-site` that Pages serves is a generated copy of that directory.

- `/` and `/pl/` – landing page (EN / PL) with the beta sign-up form
- `/privacy/` and `/privacy/pl/` – privacy policy (EN / PL); this is the URL used in the App Store and Google Play listings and inside the app
- `/delete-account/` and `/delete-account/pl/` – how to delete an account without the app (EN / PL), linked from the privacy policy and linking to the backend's `/api/users/delete-account/`

The privacy and delete-account paths must never move or disappear: the privacy pages are linked from the app
and the store listings, and the delete-account pages are how an account can be deleted without the app.

## Deploy

No build step. GitHub Pages serves the site from the public repository `shymek/wordker-site` (branch `main`,
path `/`). On every push to `main` in the source repository that touches `site/`, a GitHub Actions workflow
there copies `site/` over `wordker-site` with `rsync --delete` (including `CNAME` and `.nojekyll`), commits and
pushes, and Pages deploys from there. The workflow refuses to publish if `CNAME`, `.nojekyll` or one of the
pages above is missing, or if `CNAME` is not `wordker.app`.

So a change reaches wordker.app when it is merged to `main` through the usual release pull request from `dev`.
Never edit `wordker-site` directly: it is generated, and the next mirror overwrites it.

## Landing page

- `assets/site.css` is shared by every page; `assets/landing.css` only by the landing page.
- Phone frames are plain CSS (`.device-iphone`, `.device-pixel`) around the raw
  captures from the app (`app/store/screenshots/` in the source repository). To refresh the screens, icons and
  Open Graph images after new captures: `tools/build-assets.sh [path-to-app]` (default: the `app/` directory
  next to `site/`; needs `cwebp` and Python with Pillow).
- The beta form (`assets/beta.js`) posts form-encoded data (`email`, `platform`, `language` and the
  `website` honeypot) to `https://api.wordker.app/api/beta/signup/` (the backend's `beta` app). For a local
  preview against another backend, serve the site on localhost and add `?api=http://localhost:8000` to the
  URL; that origin also has to be in the backend's `BETA_SIGNUP_ALLOWED_ORIGINS`.

Preview locally with `python3 -m http.server` from `site/`.
