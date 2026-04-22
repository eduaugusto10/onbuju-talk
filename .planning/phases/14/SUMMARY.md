# SUMMARY - Phase 14 - Simbolos Pessoais (Camera, Galeria) e Categorias Customizadas

## Status
Concluida.

## Entregas
- `package.json`: adicionado `expo-image-picker ~17.0.10` via `npx expo install`.
- `app.json`: config plugin `expo-image-picker` com strings pt-BR (`photosPermission`, `cameraPermission`, `microphonePermission: false`).
- `src/types.ts`: novos tipos `PersonalSymbol` e `CustomCategory`.
- `src/constants.ts`: `PERSONAL_SYMBOLS_MAX = 100`, `CUSTOM_CATEGORIES_MAX = 20`.
- `src/services/personalSymbolsService.ts` (NOVO): `savePersonalSymbolImage` copia a imagem escolhida para `documentDirectory/personal-symbols/` com nome `symbol-<ts>-<rand>.<ext>`; `deletePersonalSymbolImage` e tolerante a falhas e so apaga dentro do diretorio gerenciado.
- `src/services/imageCacheService.ts`: `getCachedImageUri` agora passa direto URIs nao-http (file://, content://) sem tocar o cache remoto.
- `src/App.tsx`:
  - Novas chaves `STORAGE_KEYS.personalSymbols` e `.customCategories`.
  - `ConfigSection` estendido para incluir `'simbolos'` e `'categorias'`.
  - Estados `personalSymbols`, `customCategories`, `pickerBusy`, `pendingSymbolImage`, `pendingSymbolLabel`, `pendingSymbolCategoryId`, `isSymbolDraftOpen`, `newCustomCategoryName`, `editingCategoryId`, `editingCategoryName`.
  - Sanitizers `sanitizePersonalSymbols` e `sanitizeCustomCategories` com dedup case-insensitive.
  - Hidratacao no boot e persistencia AsyncStorage de ambos.
  - Handlers: `pickFromCamera`, `pickFromGallery`, `handlePickImageResult`, `savePendingSymbol`, `cancelPendingSymbol`, `closeSymbolDraft`, `removePersonalSymbol`, `addCustomCategory`, `removeCustomCategory` (desassocia simbolos sem apagar), `startEditCategory`, `commitEditCategory`, `cancelEditCategory`.
  - `handleCategoryClick` trata categorias custom (id `cat-...`) sem chamar ARASAAC.
  - Barra de categorias: renderiza um `CategoryButton` por `CustomCategory` apos "Customizados".
  - List card: nova branch renderiza `SymbolCard` dos `personalSymbols` filtrados pela categoria ativa, mapeando `PersonalSymbol -> SymbolItem` (reusa tap/favoritar/long-press).
  - Dois novos `ConfigNavItem`: "Simbolos" (📷) e "Categorias" (🗂).
  - Nova secao `simbolos`: 2 botoes grandes ("Tirar foto" / "Galeria") e lista de simbolos com miniatura, rotulo, nome da categoria (ou "Sem categoria") e botao remover.
  - Nova secao `categorias`: lista editavel inline com contador de simbolos por categoria, TextInput + botao "Adicionar".
  - Novo modal `symbolDraft` com preview da imagem, TextInput de rotulo (max 40) e chips de categoria (incluindo "Sem categoria"); cancelar apaga o arquivo copiado para evitar lixo.
- `src/__tests__/App.test.tsx`: 3 testes novos (hidratacao + render de simbolos na categoria, filtro por categoria com orfaos, persistencia de categorias).

## Requisitos Atendidos
- **CONT-01**: modo admin -> Simbolos -> "Tirar foto" dispara `ImagePicker.requestCameraPermissionsAsync` + `launchCameraAsync`; resultado copiado para documentDirectory/personal-symbols/ e aberto no draft modal para rotular e categorizar.
- **CONT-02**: mesmo fluxo via `launchImageLibraryAsync`. Simbolos aparecem na grade da categoria selecionada e funcionam como qualquer `SymbolItem` (tap, favoritar, long-press para remover do composer).
- **ORG-03**: secao admin "Categorias" cria/renomeia/remove categorias; renomear e refletido na barra imediatamente; remover desassocia simbolos (setam `categoryId: null`, ficam disponiveis apos criar nova categoria).

## Decisoes
- **expo-image-picker em vez de expo-camera**: picker unificado (camera + galeria) evita construir UI customizada e respeita a restricao dura de simplicidade. Nativo ja fornece crop (`allowsEditing: true`) e compressao (`quality: 0.8`).
- **Imagens no FileSystem, metadados em AsyncStorage**: padrao consistente com `imageCacheService`. Cuidador removendo simbolo tambem apaga o arquivo (chamada silenciosa via `deletePersonalSymbolImage`).
- **Remover categoria nao apaga simbolos**: comportamento mais seguro para cuidadores — simbolos ficam como "Sem categoria" e podem ser reassociados. Equivalente a `ON DELETE SET NULL`.
- **Categorias custom vivem na mesma barra das nativas**: mantem motor planning horizontal consistente. Alternativa (nova tela separada) quebraria o padrao do app.
- **Personal symbols mapeam para `SymbolItem` inline no render** em vez de uma camada de wrapper: evita estado derivado e mantem a API do `SymbolCard` intacta.
- **Draft modal com chips de categoria** em vez de dropdown: melhor ergonomia em touch e consistente com `OptionChip` do app.
- **`getCachedImageUri` pass-through para URIs locais**: impede que URIs `file://` passem pelo caminho de download remoto, o que falharia silenciosamente e retornaria o URI original mesmo assim — a mudanca e defensiva e remove custo de I/O inutil.

## Verificacoes
- `npm run lint`: OK.
- `npm run test -- --runInBand`: 21 tests, 17 passando. 3 testes novos de Phase 14 passam (hidrata simbolos+custom category, orfaos nao aparecem em categoria custom, persistencia). 4 falhas pre-existentes da Milestone 2 permanecem (icone `☰`, texto "Configuração") — mesmo conjunto listado nos SUMMARYs das Phases 12 e 13.
- `expo-doctor` nao executado nesta sessao; packager ira avaliar quando user rodar build.

## Impacto
- Permissoes iOS/Android adicionadas via plugin (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` em pt-BR). Build nativo precisa de rebuild (prebuild + bundled binary).
- `app.json` ganhou campo `plugins`; config plugins aplicam automaticamente no proximo build nativo.
- `documentDirectory/personal-symbols/` e criado sob demanda; sem impacto inicial no storage. Limite logico de 100 simbolos; ~48KB medio por imagem JPEG compressed = ~5MB max esperado.
- Barra de categorias ganha entradas dinamicas; testes de densidade (2-5 cols) nao afetados (barra e horizontal).
- Superficie de configuracao: +2 abas ("Simbolos", "Categorias") na `configNav`.
- Comportamento offline: 100% local; nenhuma chamada remota adicional.

## Divida Tecnica Observada
- 4 testes pre-existentes continuam falhando (herdados de Phase 12, `☰` + "Configuração"). Sugestao: fase de polimento dedicada ainda pendente.
- `ImagePicker.MediaTypeOptions` esta deprecated pelo expo-image-picker 17 em favor do array `['images']`. Em futura passagem, migrar para a nova API quando a minSDK permitir. Nao-bloqueante.
- `removePersonalSymbol` faz um `setPersonalSymbols` seguido de `deletePersonalSymbolImage` async — se o delete falhar, o arquivo fica orfao ate o app ser desinstalado. Aceitavel (silent log, storage e bounded).

## Proximo Passo
- Phase 15: Voz Gravada do Cuidador — reusa o editor de simbolo adicionando gravacao de audio via expo-av (ou expo-audio) no draft modal.
