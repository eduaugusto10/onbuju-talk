# Testing

## Current State
- No automated test framework configured (no Jest/RTL/Detox setup found)
- Verification currently relies on:
  - Type-check gate: `npm run lint` (`tsc --noEmit`)
  - Manual device/emulator testing through Expo

## Existing Quality Signals
- TypeScript strict mode catches many structural/type regressions
- Runtime feedback via toasts and defensive fallbacks in services

## Key Gaps
- No unit tests for caching behavior in service modules
- No integration tests for ARASAAC/AI flows and fallback behavior
- No UI/regression tests for layout edge cases (small screens, empty lists)

## Recommended Next Steps
- Add unit tests for:
  - `arasaacService` cache resolution and dedupe behavior
  - `imageCacheService` cache-hit/miss behavior
- Add component-level tests for action flows in `App.tsx`
- Consider E2E smoke tests (Detox) for critical user paths
