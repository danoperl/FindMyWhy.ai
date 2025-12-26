# FindMyWhy.ai

A reflection and clarity tool built with React and Vite.

## Development

### Quick Start

```bash
npm install
npm run dev
```

### Development Modes

This project has two development modes depending on what you're working on:

**UI-only development (fast, no API routes):**
```bash
npm run dev:ui
# or
npm run dev
```
- Runs Vite dev server only
- Fast HMR for UI changes
- `/api/*` routes will return 404

**Full development (UI + API routes):**
```bash
npm run dev:full
```
- Runs Vercel dev server
- Serves both UI (via Vite) and `/api/*` routes
- Required for testing DM flows that use `/api/dm5`
- Visit http://localhost:3000 (or the port shown) - `/api/dm5` should not 404

### When to Use Which Mode

- Use `dev:ui` for: UI changes, styling, component work, testing non-DM flows
- Use `dev:full` for: Testing DM flows, API route changes, end-to-end feature testing

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
