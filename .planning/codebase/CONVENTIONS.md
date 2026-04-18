# Conventions

## Language and Naming
- UI labels and user-facing text are in Portuguese (pt-BR)
- Internal code identifiers are mostly English
- Services use `camelCase` function names and descriptive cache-key prefixes

## TypeScript
- Strict mode enabled in `tsconfig.json`
- Shared interfaces in `src/types.ts`
- Minimal use of `any` remains in ARASAAC API mapping logic

## React Patterns
- Hooks-first functional components
- `useCallback` for event handlers and `useMemo` for derived lists/text
- Side effects isolated in `useEffect` (bootstrap + persistence sync)

## Storage/Caching
- AsyncStorage keys centralized in constants or prefixed by concern
- Multi-level caching pattern:
  - In-memory maps for session speed
  - AsyncStorage/FileSystem for persistent local reuse

## UX Patterns
- Toast feedback for success/error actions
- Explicit admin gating for sensitive actions (favorites/custom management)
