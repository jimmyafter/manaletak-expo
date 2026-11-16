# Mana Letak: instructions for Claude Code

App that remembers where household things are stored. Photo-first capture, search later. Malaysia, BM + English.
Read `SPEC.md` first (scope, schema, AI prompts, plans). `android-reference/` is the earlier Kotlin scaffold, kept only for reference; delete it once nothing is needed from it.

## Stack
Expo (React Native, TypeScript), Expo Router, expo-sqlite (FTS5 with LIKE fallback), expo-camera, expo-file-system (new File/Directory API), expo-image. Later: Supabase, Gemini via Edge Function, RevenueCat, EAS builds.

## Layout
- `lib/search.ts, path.ts, quota.ts`: pure logic, no imports, tested with `npm test` (node:test).
- `lib/db.ts, repo.ts`: SQLite schema and queries. `lib/theme.ts, i18n.tsx, ui.tsx`: tokens, EN/MS strings, shared components.
- `app/(tabs)/`: Add (camera), Find, Places. `app/confirm.tsx`: confirm form.

## Rules
1. Never log photos, audio, transcripts or item names.
2. No secrets in git. The Gemini key lives only in Supabase Edge Function secrets.
3. Every user-facing string goes in both languages in `lib/i18n.tsx`.
4. Local-first: capture, search and browse work offline; AI/network failure falls back to the manual form.
5. Photos stay on the phone unless Plus + opt-in; only a resized JPEG (max 1280 px) may leave the device.
6. Sensitive items hide their photo in lists.
7. AI output is confirmed by the user, never trusted blindly.
8. Design: body 16, min 12, touch targets 48, radii 14/20/28, tokens in `lib/theme.ts`. Add new colours to the Style board and check 4.5:1 first.

## Commands
`npm start` (Expo), `npm test`, `npm run typecheck`, `npm run bundle`. Run `npx expo install --fix` after changing dependencies.

## Status
Slice 1 written without network access: pure logic tests pass; typecheck and bundle have NOT been run yet (CI does that). First job: run them, fix errors, try on a real phone, confirm FTS5 works there.
