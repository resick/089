# 089

Munich-first city discovery app: what to do right now, tonight and this weekend.

- Product spec: [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)
- Plan and decisions: [docs/](docs/) — start with [ANALYSIS](docs/ANALYSIS.md) and [ROADMAP](docs/ROADMAP.md)
- Commands, conventions and gotchas: [CLAUDE.md](CLAUDE.md)

## Quick start

Requires Node 24 and pnpm (pinned in `package.json`, via corepack).

```bash
pnpm install
pnpm check
pnpm dev:web
```

Copy `apps/mobile/.env.example` and `apps/web/.env.example` to `.env.local` in the same folders first. The mobile app needs a development build (MapLibre is a native module); see CLAUDE.md.
