# wordker.app

Static site for the Wordker mobile game, served by GitHub Pages at https://wordker.app.

- `/` and `/pl/` – landing page (EN / PL) with the beta sign-up form
- `/privacy/` and `/privacy/pl/` – privacy policy (EN / PL); this is the URL used in the App Store and Google Play listings and inside the app

No build step: edit the HTML, push to `main`, Pages deploys it.

## Landing page

- `assets/site.css` is shared by every page; `assets/landing.css` only by the landing page.
- Phone frames are plain CSS (`.device-iphone`, `.device-pixel`) around the raw
  captures from the app repo. To refresh the screens, icons and Open Graph
  images after new captures: `tools/build-assets.sh [path-to-wordker_app]`.
- The beta form (`assets/beta.js`) posts JSON to
  `https://api.wordker.app/api/beta/signup/` (see `beta/` in the backend repo).
  For a local preview against another backend, serve the site on localhost and
  add `?api=http://localhost:8000` to the URL.

Preview locally with `python3 -m http.server` from the repo root.
