# Project Context: Prompt Optimizer

## Overview
**Prompt Optimizer** is a comprehensive AI prompt engineering tool designed to help users write better prompts for Large Language Models (LLMs). It supports multiple platforms including Web, Desktop (Electron), Chrome Extension, and Docker. The project is a monorepo managed by `pnpm`.

## Architecture & Tech Stack

### Core Technologies
- **Language:** TypeScript, JavaScript
- **Runtime:** Node.js (>=18)
- **Package Manager:** pnpm (v10+)
- **Frontend Framework:** Vue 3
- **Build Tool:** Vite
- **UI Library:** Naive UI, Tailwind CSS
- **State Management:** Pinia (inferred)
- **Editor:** CodeMirror 6
- **Testing:** Vitest (Unit), Playwright (E2E)
- **Desktop Framework:** Electron
- **Containerization:** Docker

### Package Structure (Monorepo)
The project is organized into a workspace under `packages/`:

- **`packages/core`**: Core business logic, shared utilities, and API clients.
- **`packages/ui`**: Reusable UI components based on Naive UI and Vue 3.
- **`packages/web`**: The main Web application (Vite + Vue 3).
- **`packages/desktop`**: The Desktop application wrapper (Electron) utilizing the web code.
- **`packages/extension`**: The Chrome Browser Extension.
- **`packages/mcp-server`**: Model Context Protocol (MCP) server implementation.

## Development Workflows

### Initial Setup
```bash
pnpm install
```

### Development Servers
- **Web App:** Builds `core` & `ui`, then starts the web server.
  ```bash
  pnpm dev
  ```
- **Desktop App:** Builds `core`, `ui`, & `web`, then starts the Electron app.
  ```bash
  pnpm dev:desktop
  ```
- **Fresh Start (Clean & Reinstall):**
  ```bash
  pnpm dev:fresh
  ```

### Building
- **Build All:**
  ```bash
  pnpm build
  ```
- **Build Specific Package:**
  ```bash
  pnpm build:core
  pnpm build:ui
  pnpm build:web
  pnpm build:desktop
  ```

### Testing
- **Unit Tests (Vitest):**
  ```bash
  pnpm test
  ```
- **E2E Tests (Playwright):**
  ```bash
  pnpm test:e2e
  ```

### Versioning & Release
The project uses semantic versioning and automated scripts:
- **Prepare Version:** `pnpm version:prepare <patch|minor|major>`
- **Tag Version:** `pnpm version:tag`
- **Publish Tag:** `pnpm version:publish`
- **Desktop Release:** Triggered automatically by pushing a git tag.

## Environment Configuration
Create a `.env.local` file in the root directory for local development keys:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=...
VITE_DEEPSEEK_API_KEY=...
# Custom API Configuration
VITE_CUSTOM_API_KEY=...
VITE_CUSTOM_API_BASE_URL=...
```

## Key Files
- **`pnpm-workspace.yaml`**: Defines the monorepo workspace.
- **`package.json`**: Root scripts and dependencies.
- **`dev.md`**: Detailed development guide.
- **`docker-compose.yml`**: Docker deployment configuration.
- **`packages/ui/package.json`**: Defines UI dependencies (Naive UI, Tailwind).
- **`packages/web/vite.config.ts`**: Web build configuration.

## Conventions
- **Commit Messages:** Follow conventional commits (e.g., `feat(ui): ...`, `fix(core): ...`).
- **Code Style:** TypeScript, Composition API for Vue components.
- **Styling:** Utility-first CSS with Tailwind CSS combined with Naive UI components.
