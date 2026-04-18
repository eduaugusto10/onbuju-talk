# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run start` — launch Expo dev server
- `npm run android` / `npm run ios` — run on device/emulator
- `npm run lint` — type-check via `tsc --noEmit` (this is the lint gate; there is no ESLint)
- `npm run test` — Jest (`--runInBand`); watch with `npm run test:watch`
- Single test: `npx jest src/services/__tests__/aiService.test.ts` (or `-t "pattern"` to filter)
- `npm run fix:expo` — align dependency versions with Expo SDK (`expo install --fix`)
- `npm run doctor` — `expo-doctor` health check

## Architecture

Single-screen Expo app. `App.tsx` re-exports `src/App.tsx`, which is a monolithic functional component owning all UI, state, and orchestration via React hooks — there is no global store, no navigation library, and no separate screens. Business logic lives only in three service modules under `src/services/`:

- `arasaacService.ts` — ARASAAC pictogram/category fetch; two-tier cache (in-memory Map + AsyncStorage under `arasaac_cache_` prefix). `getBestSymbols` fans out `COMMON_TERMS` (from `src/constants.ts`) into parallel searches and dedupes.
- `aiService.ts` — Gemini Flash call for phrase normalization; retry with backoff, 8s abort timeout, AsyncStorage prompt cache under `ai_cache_`. API key resolution order: `EXPO_PUBLIC_GOOGLE_AI_API_KEY` env → `EXPO_PUBLIC_GOOGLE_API_KEY` env → stored setting (`ai_settings_v1`). Missing key returns a degraded result that joins labels verbatim rather than throwing.
- `imageCacheService.ts` — disk-backed image cache in `FileSystem.documentDirectory/arasaac-images/` using `expo-file-system/legacy`. LRU eviction bounded by `MAX_CACHE_BYTES` (300MB) / `TARGET_CACHE_BYTES` (240MB); index persisted to AsyncStorage under `image_cache_index_v1`. `warmImageCache` batches downloads at concurrency 6.

Data flow: UI calls service → service checks memory cache → AsyncStorage/FileSystem → network. Failures degrade silently to fallbacks (empty arrays, verbatim labels, remote URI passthrough); services rarely throw.

Persistence keys are centralized in the `STORAGE_KEYS` const inside `src/App.tsx` (favorites, custom symbols, TTS pitch/rate, admin password hash, UI scale, contrast mode, visual feedback, intro skip, grid columns). Admin auth uses the `hashSecret` FNV-variant hash in `src/App.tsx` against `STORAGE_KEYS.adminPasswordHash`.

## Conventions

- TypeScript strict mode. User-facing strings are pt-BR; code identifiers are English.
- When adding a new persistent setting, add its key to `STORAGE_KEYS`, hydrate it in the boot `useEffect` in `src/App.tsx`, and persist on change.
- When calling external APIs, follow the existing pattern: memory cache → persistent cache → fetch → degrade gracefully. Don't add throw-on-failure paths to services.
- Jest preset is `jest-expo`; `jest.setup.ts` mocks AsyncStorage. `.planning/` is excluded from test discovery.

## Planning Artifacts

`.planning/` holds the GSD workflow state (PROJECT.md, ROADMAP.md, STATE.md, phase dirs, milestone archives, and `.planning/codebase/` maps). Milestones 1 and 3 are shipped; Milestone 2 (UX remodel, phases 5–7) is the active scope per `ROADMAP.md`. Treat these as source of truth for product intent — do not modify shipped milestone archives.
