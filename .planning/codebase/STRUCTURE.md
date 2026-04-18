# Structure

## Root
- `App.tsx`: Expo entry re-export (`./src/App`)
- `app.json`: Expo config
- `babel.config.js`: Expo Babel preset
- `tsconfig.json`: extends Expo TS base, strict enabled
- `package.json`: scripts + dependencies

## Source Tree
- `src/App.tsx`
  - Main screen, state orchestration, rendering and interaction handlers
- `src/types.ts`
  - Shared domain types (`SymbolItem`, `CustomSymbol`)
- `src/constants.ts`
  - Seed terms and fallback categories
- `src/services/arasaacService.ts`
  - Symbol/category retrieval and JSON cache
- `src/services/aiService.ts`
  - AI phrase generation and prompt-level cache
- `src/services/imageCacheService.ts`
  - Image file caching and pre-warming

## Hidden/Internal
- `.expo/`: local Expo runtime artifacts
- `.planning/codebase/`: generated codebase map documents
