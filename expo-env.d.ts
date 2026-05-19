/// <reference types="expo/types" />

// Declaracoes de modulos de asset para o bundler do Expo/Metro.
// Necessario para importar arquivos de fonte (.ttf) — como os pesos da
// Nunito de `@expo-google-fonts/nunito` — em modulos TypeScript sem que
// `tsc --noEmit` reclame de modulo nao encontrado.
declare module '*.ttf' {
  const asset: number;
  export default asset;
}

declare module '*.otf' {
  const asset: number;
  export default asset;
}
