# j24-bi

## Cursor Cloud specific instructions

This repo is a **static, client-side HTML prototype** (the "J24 BI" dashboards). There is no backend, database, package manager, build step, or dependency manifest — just four `.html` files at the repo root:

- `index.html` — landing / role-selection hub
- `ge_dashboard.html` — General Executive dashboard
- `gm_dashboard.html` — General Manager dashboard
- `category_manager_dashboard.html` — Category Manager dashboard

All data is hardcoded inline JavaScript (mock data). Pages link to each other via relative `href`s.

### Running it
Serve the repo root with any static file server and open `index.html`, e.g.:

```
python3 -m http.server 8000   # then visit http://localhost:8000/index.html
```

`python3` is preinstalled. Opening files via `file://` also works, but a static server gives clean relative-link navigation between pages.

### Notes
- Google Fonts and Font Awesome are loaded from CDNs at runtime; without internet, only fonts/icons degrade — all layout, mock data, and navigation still work offline.
- There is **no lint/test/build tooling** in this repo. "Build" = the files as-is; "test" = open the pages and click through the role cards.
