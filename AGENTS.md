# Personal globe page (Cloudflare Pages)

- Static site, no build step. Output dir: `public/` (see `wrangler.toml`).
- Globe: globe.gl via CDN (pinned version in `public/index.html`), logic in `public/main.js`.
- Avatar: `public/assets/avatar.jpg` (full-length photo; head crop via `.avatar img` width/left/top in `style.css` — adjust if photo changes).
- Local preview: `python -m http.server 8788 --directory public` (wrangler 4 needs Node >= 22; `npm run dev` otherwise).
- Deploy: `npm run deploy` (Node >= 22, `npx wrangler login` first).
- Git remote: https://github.com/Sonny522/sonny (branch `main`). github.com only reachable via local proxy; push with
  `git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push`.
