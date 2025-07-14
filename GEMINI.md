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