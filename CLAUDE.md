# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run all tests with Vitest
npm test -- --watch  # Run tests in watch mode
npm run db:reset     # Reset database (destructive)
```

To run a single test file:
```bash
npm test -- src/lib/__tests__/file-system.test.ts
```

## Environment

Requires `ANTHROPIC_API_KEY` in `.env`. If absent, the app falls back to a `MockLanguageModel` that returns static demo content.

## Architecture

**UIGen** is a Next.js 15 app where users describe React components in natural language and Claude generates them with live preview. Projects are persisted for authenticated users; anonymous sessions work without saving.

### AI Generation Flow

- `src/app/api/chat/route.ts` — The chat API endpoint. Streams responses from Claude using the Vercel AI SDK (`@ai-sdk/anthropic`). Claude is given two tools:
  - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — Create/edit/view files
  - `file_manager` (`src/lib/tools/file-manager.ts`) — Create/delete directories
- `src/lib/prompts/generation.tsx` — System prompt for component generation
- `src/lib/provider.ts` — Selects real vs. mock language model based on API key presence

### Virtual File System

`src/lib/file-system.ts` — In-memory `VirtualFileSystem` class (no disk writes). Supports nested directories, file CRUD, and JSON serialization for database storage. This is what Claude writes generated component files into.

### State Management

Two React contexts manage the core client state:
- `src/lib/contexts/file-system-context.tsx` — Wraps `VirtualFileSystem`, exposes file operations to the UI
- `src/lib/contexts/chat-context.tsx` — Manages chat history and communicates with the chat API

### Authentication

- `src/lib/auth.ts` — JWT sessions (7-day expiry) with bcrypt password hashing
- `src/actions/index.ts` — Server actions for `signUp`, `signIn`, `signOut`, `getUser`
- `src/middleware.ts` — Protects routes requiring auth

### Database

Prisma with SQLite (`prisma/dev.db`). Two models:
- `User` — email/password accounts
- `Project` — stores chat history (`messages`) and file system state (`data`) as JSON strings; `userId` is optional (supports anonymous projects)

### Component Preview

`src/components/preview/PreviewFrame.tsx` — Renders generated components in an iframe. `src/lib/transform/jsx-transformer.ts` handles JSX transpilation for the preview.

### UI

- `src/components/ui/` — shadcn/ui primitives (Radix UI + Tailwind CSS v4)
- `src/components/editor/CodeEditor.tsx` — Monaco editor wrapper
- `src/components/chat/` — Chat interface components
- `src/app/main-content.tsx` — Main split-panel layout shell
