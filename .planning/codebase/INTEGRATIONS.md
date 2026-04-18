# Integrations

## External APIs
- ARASAAC API (`https://api.arasaac.org/api`)
  - Search pictograms
  - Fetch categories/tags
  - Fetch pictograms by category/tag
- ARASAAC static image CDN (`https://static.arasaac.org/pictograms`)
  - Delivers symbol image assets

## AI Service
- Google Generative Language API (Gemini Flash endpoint)
  - Used to normalize selected symbols into a sentence
  - API key is hardcoded in `src/services/aiService.ts`

## Device/OS Capabilities
- Text-to-speech via `expo-speech`
- File cache via `expo-file-system`
- Persistent key-value storage via AsyncStorage

## Integration Characteristics
- Network-first behavior with local fallback/cache in services
- No retry/backoff layer; failures mostly return empty arrays or fallback strings
