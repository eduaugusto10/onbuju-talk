# Concerns

## Security
- High: Google API key is hardcoded in source (`src/services/aiService.ts`)
- Medium: Admin authentication uses a fixed local password (`adm123`) in UI logic

## Reliability
- Network operations have limited retry/error classification
- API schema assumptions use `any`; unexpected payload changes can break mapping
- Image cache uses OS cache directory, which may be evicted without notice

## Performance
- `App.tsx` is a large monolithic component; render and state complexity is rising
- Warm-cache behavior is bounded but still does parallel downloads on list updates
- Category and symbol fetching may trigger repeated remote calls across sessions

## Maintainability
- Business rules mixed into UI component increase change risk
- Missing automated tests limits confidence for refactors
- Some feature concerns (admin, speech, symbols, menu) would benefit from modular split

## Product/UX
- TTS on iOS depends on silent-mode hardware switch behavior
- Offline mode is partial (cached-only), without explicit offline UX state
