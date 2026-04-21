# UIGen

AI-powered React component generator with live preview.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Optional** Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your-api-key-here
```

The project will run without an API key. Rather than using a LLM to generate components, static code will be returned instead.

2. Install dependencies and initialize database

```bash
npm run setup
```

This command will:

- Install all dependencies
- Generate Prisma client
- Run database migrations

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign up or continue as anonymous user
2. Describe the React component you want to create in the chat
3. View generated components in real-time preview
4. Switch to Code view to see and edit the generated files
5. Continue iterating with the AI to refine your components

## Features

- AI-powered component generation using Claude
- Live preview with hot reload
- Virtual file system (no files written to disk)
- Syntax highlighting and code editor
- Component persistence for registered users
- Export generated code

## Local Development Findings

Observations from running the project locally:

- **No API key required** — with `ANTHROPIC_API_KEY=""` (empty) in `.env`, the app falls back to `MockLanguageModel` and returns static demo components (Counter, ContactForm, Card). The app is fully functional without a real key.
- **Dev server startup** — `npm run dev` uses Turbopack (`next dev --turbopack`) wrapped with `NODE_OPTIONS='--require ./node-compat.cjs'` for Node.js compatibility. Server is ready in ~2–3 seconds.
- **Pre-built state** — after `npm run setup`, the project is ready to run immediately: `node_modules/` are installed, `src/generated/prisma/` client is generated, and `prisma/dev.db` has all 4 migrations applied.
- **Anonymous usage works** — no sign-up needed; users can generate components without an account.
- **Gallery feature** — click the **Gallery** button to open the component sidebar. It shows previously generated components; it will be empty on a fresh database.
- **Network access** — the server binds to all interfaces (`0.0.0.0`), so it is reachable on the local network at the host's IP on port 3000.

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma with SQLite
- Anthropic Claude AI
- Vercel AI SDK
