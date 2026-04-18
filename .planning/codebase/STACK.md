# Stack

## Runtime
- React Native `0.81.0`
- Expo SDK `54`
- React `19.1.0`
- TypeScript `~5.8` (strict mode enabled)

## Core Libraries
- `@react-native-async-storage/async-storage` for local persistence
- `expo-speech` for text-to-speech playback
- `expo-file-system` (legacy API) for on-device image cache

## Tooling
- `babel-preset-expo`
- `expo-doctor` script available
- `tsc --noEmit` used as lint/type-check gate

## App Model
- Single-screen app (`src/App.tsx`) with local state and service modules
- No navigation library currently in use
