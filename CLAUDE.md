# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Web Builder - A full-stack application that generates complete Next.js projects through natural language prompts with live preview capabilities.

## Architecture

The project consists of two separate applications:

1. **Frontend (Next.js)** - Port 3000

   - Main UI and chat interface
   - Proxies preview requests to backend dev servers
   - WebSocket client for real-time updates

2. **Backend (Express)** - Port 4000
   - Manages project generation and dev servers
   - WebSocket server for real-time communication
   - Integrates with Claude CLI for code generation

## Common Commands

```bash
# Development (run both frontend and backend)
pnpm dev:all

# Run only frontend
pnpm dev

# Run only backend server
pnpm dev:server

# Build frontend
pnpm build

# Lint
pnpm lint

# Backend only commands (in server directory)
cd server && pnpm dev   # Run backend with nodemon
cd server && pnpm build # Build TypeScript
cd server && pnpm start # Run production build
```

## Key Implementation Details

### Project Generation Flow

1. User submits prompt via chat interface
2. Frontend sends WebSocket event `generate_request` to backend
3. Backend executes these steps:
   - Copies template from `/server/template/` to `/server/sessions/{sessionId}/project/`
   - Runs `pnpm install` in the new project
   - Starts Next.js dev server on available port (starting from 3001)
   - Executes Claude CLI: `claude --dangerously-skip-permissions -p "{prompt}"`
   - Emits status updates via WebSocket throughout the process

### Claude Integration

The system uses Claude CLI with a 3-minute timeout:

```typescript
const subprocess = execa(
  'claude',
  ['--dangerously-skip-permissions', '-p', claudePrompt],
  {
    cwd: projectInfo.projectPath,
    timeout: 300000, // 5 minutes
    shell: false,
  },
);
```

If Claude fails, a fallback demo page is created.

### Port Management

- Frontend: 3000
- Backend: 4000
- Generated projects: 3001+ (automatically assigned)
- Port tracking in `ProjectManager.ports` Map

### WebSocket Events

- `generate_request`: Start project generation
- `generation_status`: Status updates (creating, starting, generating, complete, error)
- `preview_ready`: Dev server is running
- `code_updated`: Code has been modified
- `log`: Server logs for debugging

### Proxy System

Frontend proxies to backend dev servers via `/api/proxy/[sessionId]/`:

- Modifies HTML to rewrite resource URLs through the proxy
- Handles all content types (HTML, JS, CSS, images)
- Preserves proper headers and caching

## Project Structure

```
/
├── src/                    # Frontend Next.js app
│   ├── app/
│   │   ├── api/proxy/     # Proxy route handler
│   │   └── page.tsx       # Main UI
│   └── components/
│       ├── chat/          # Chat interface
│       └── preview/       # Preview iframe
├── server/                # Backend Express server
│   ├── src/
│   │   ├── index.ts       # Express + Socket.io setup
│   │   └── project-manager.ts # Core generation logic
│   ├── template/          # Next.js template project
│   └── sessions/          # Generated projects (gitignored)
└── template/              # Alternative template location
```

## Important Conventions

### From Cursor Rules

1. **File Naming**: Always use `kebab-case` for all files
2. **Components**: PascalCase for component names, but kebab-case for files
3. **Package Manager**: Always use `pnpm`
4. **Styling**: Tailwind CSS v4 (no config file, use globals.css)
5. **UI Components**: Use shadcn/ui components
6. **State Management**: Use Jotai for global state
7. **Icons**: Use lucide-react

### Git Workflow

- Branch naming: `type/description[-#issue]`
- Types: feat, fix, docs, style, refactor, test, chore
- Commit messages follow Conventional Commits

### Testing

When implementing features:

1. Follow TDD principles (Red → Green → Refactor)
2. Write one test at a time
3. Use Playwright for E2E tests (in `tests/` directory)

## Current Implementation Notes

1. **Claude Timeout**: Currently set to 3 minutes as Claude can take longer to respond
2. **Template Approach**: Uses template copying instead of `create-next-app` for speed
3. **Session Management**: Each session gets its own directory and port
4. **Process Cleanup**: Uses `tree-kill` for proper process termination

## Development Tips

1. **Debugging Claude**: Use `server/test-claude.js` to test Claude integration in isolation
2. **Port Issues**: Check if ports 3001+ are available before testing
3. **WebSocket Debugging**: Enable Socket.io debug logs with `DEBUG=socket.io:*`
4. **Process Management**: Monitor running Node processes to ensure cleanup

## Known Issues & Solutions

1. **Claude Hanging**: Increased timeout to 3 minutes, added progress logging
2. **Proxy URL Issues**: Fixed by ensuring paths start with `/`
3. **Port Conflicts**: Implemented automatic port finding starting from 3001

## Environment Variables

Required in `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here  # Currently not used, relies on Claude CLI
```

## Key Files to Understand

1. `/server/src/project-manager.ts` - Core project generation logic
2. `/src/app/api/proxy/[sessionId]/route.ts` - Proxy implementation
3. `/server/src/index.ts` - WebSocket server setup
4. `/src/components/chat/chat-interface.tsx` - Main UI component

<rules>
The following rules should be considered foundational. Make sure you're familiar with them before working on this project:
@.cursor/rules/common/cursor-rules.mdc
@.cursor/rules/common/self-improve.mdc
@.cursor/rules/common/vibe-coding.mdc

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.:
@.cursor/rules/common/gemini-cli.mdc

Git convention defining branch naming, commit message format, and issue labeling based on GitFlow and Conventional Commits.:
@.cursor/rules/common/git-convention.mdc

Guidelines for writing tests and implementing code following TDD and Tidy First principles.:
@.cursor/rules/common/tdd.mdc

Guidelines for writing Next.js apps with Supabase Auth:
@.cursor/rules/supabase/bootstrap-auth.mdc

Guidelines for writing Supabase database functions:
@.cursor/rules/supabase/create-db-functions.mdc

Guidelines for writing Postgres migrations:
@.cursor/rules/supabase/create-migration.mdc

Guidelines for writing Postgres Row Level Security policies:
@.cursor/rules/supabase/create-rls-policies.mdc

For when modifying the Supabase database schema.:
@.cursor/rules/supabase/declarative-database-schema.mdc

Guidelines for writing Postgres SQL:
@.cursor/rules/supabase/postgres-sql-style-guide.mdc

Coding rules for Supabase Edge Functions:
@.cursor/rules/supabase/writing-edge-functions.mdc

Playwright 테스트 작성 가이드:
@.cursor/rules/web/playwright-test-guide.mdc

When working with files that match the following extensions (.js, .jsx, .ts, .tsx), review and apply the relevant rules:
@.cursor/rules/web/nextjs-convention.mdc
@.cursor/rules/web/toss-frontend.mdc
</rules>
