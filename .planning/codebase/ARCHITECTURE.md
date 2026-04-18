# Architecture

## High-Level Shape
- Client-only mobile app built with Expo + React Native
- Presentation and orchestration centralized in `src/App.tsx`
- Domain logic split into focused service modules under `src/services`

## Main Layers
- UI Layer
  - Renders symbol grid, category chips, selected phrase, action buttons, modals
  - Handles interaction flow (search, save custom group, play voice, admin actions)
- Service Layer
  - `arasaacService.ts`: ARASAAC retrieval + metadata caching
  - `aiService.ts`: phrase normalization through Gemini API
  - `imageCacheService.ts`: disk-backed image cache
- Storage Layer
  - AsyncStorage for app preferences and cached JSON payloads
  - FileSystem cache directory for downloaded images

## State Management
- Local component state via React hooks (`useState`, `useMemo`, `useEffect`, `useCallback`)
- No global state/store library at this stage

## Data Flow
1. UI requests symbols/categories through service methods
2. Services resolve from memory/persistent cache or remote fetch
3. UI updates local state and renders lists
4. User actions persist changes (favorites, custom groups, speech settings)
