# Personal globe page (Cloudflare Workers static assets)

- Static site, no build step. Served as Worker `sonny` with `[assets] directory = "./public"` (see `wrangler.toml`).
- Cloudflare Workers Builds is connected to the GitHub repo: pushing to `main` runs `npx wrangler deploy`.
- URLs: https://sonny.us.ci (custom domain, zone on Cloudflare; domain registered at DNSHE with NS -> Cloudflare) and https://sonny.522735184.workers.dev.
- Globe: globe.gl via CDN (pinned version in `public/index.html`), logic in `public/main.js`.
- Avatar: `public/assets/avatar.jpg` (full-length photo; head crop via `.avatar img` width/left/top in `style.css` — adjust if photo changes).
- Local preview: `python -m http.server 8788 --directory public` (wrangler 4 needs Node >= 22; `npm run dev` otherwise).
- Deploy: `npm run deploy` (Node >= 22, `npx wrangler login` first).
- Git remote: https://github.com/Sonny522/sonny (branch `main`). github.com only reachable via local proxy; push with
  `git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push`.
