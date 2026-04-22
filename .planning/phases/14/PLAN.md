# PLAN - Phase 14 - Simbolos Pessoais (Camera, Galeria) e Categorias Customizadas

## Objetivo
Permitir que o cuidador adicione fotos familiares como simbolos (via camera ou galeria), os rotule, e organize o acervo em categorias customizadas que aparecem na barra de categorias ao lado das nativas.

## Requisitos Mapeados
- CONT-01: criar simbolo a partir da camera com rotulo e categoria opcional.
- CONT-02: criar simbolo a partir da galeria do dispositivo.
- ORG-03: criar, renomear e remover categorias customizadas e associar simbolos a elas.

## Escopo
- Novas dependencias nativas: `expo-image-picker` (camera + galeria em uma unica API, evita o overhead de integrar `expo-camera` com UI propria; mantem a restricao de simplicidade).
- `app.json`: `plugins` com `expo-image-picker` incluindo strings pt-BR para `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription` (nao solicitar audio aqui, so camera/fotos).
- Novo service `src/services/personalSymbolsService.ts` espelhando padrao de `imageCacheService`:
  - Copia imagens picked para `FileSystem.documentDirectory + 'personal-symbols/'` via `expo-file-system/legacy` (mesmo padrao do cache).
  - Exporta `savePersonalSymbolImage(sourceUri): Promise<string>` e `deletePersonalSymbolImage(uri): Promise<void>`.
  - Sanitiza nome do arquivo por hash/Date.now + extensao original.
- Novos tipos em `src/types.ts`:
  - `PersonalSymbol { id: string; label: string; categoryId: string | null; imageUri: string; createdAt: string }`
  - `CustomCategory { id: string; name: string; createdAt: string }`
- Novas chaves em `STORAGE_KEYS`: `personalSymbols` (`arasaac_personal_symbols`), `customCategories` (`arasaac_custom_categories`).
- Estado em `src/App.tsx`:
  - `personalSymbols`, `customCategories`, `newCustomCategoryName`, `editingCategoryId`, `editingCategoryName`, `pickerInProgress`, e formulario de criacao do simbolo (`draftLabel`, `draftCategoryId`, `draftImageUri`).
  - Hidratacao no boot e persistencia de ambos.
- Barra de categorias:
  - Cada `CustomCategory` vira um botao na barra, renderizado apos `Customizados` (ou no lugar dele). Selecao mostra `SymbolCard` das `PersonalSymbol` associadas.
  - Nova categoria virtual "Meus simbolos" renderizada quando ha pelo menos um personal symbol e nenhuma categoria custom selecionada — mostra todos os personal symbols (tap usa como qualquer `SymbolItem` normal, gravando no `selectedSymbols`).
- Secao admin no config modal:
  - Novo `ConfigSection 'simbolos'` com `ConfigNavItem` "Simbolos" e icone `📷`.
  - Card 1: "Adicionar simbolo pessoal": botoes "Tirar foto" e "Escolher da galeria"; ao escolher imagem, abre sub-modal para definir rotulo e categoria opcional, com botao Salvar/Cancelar.
  - Card 2: Lista de personal symbols existentes com miniatura, rotulo, categoria e botao remover (que apaga tambem arquivo local via service).
  - Mensagem de bloqueio para nao-admin.
- Secao admin `ConfigSection 'categorias'`:
  - Novo `ConfigNavItem` "Categorias" e icone `🗂`.
  - Lista de `customCategories`: renomear inline (editor), remover (com confirmacao via toast), contador de simbolos associados.
  - TextInput para adicionar nova categoria (dedup case-insensitive, limite `CUSTOM_CATEGORIES_MAX = 20`).
  - Mensagem de bloqueio para nao-admin.
- Integracao com o grid existente:
  - Ao selecionar uma `customCategories` na barra, renderizar `FlatList` de `SymbolCard` (reutilizando o mesmo componente) alimentado por `personalSymbols.filter(ps => ps.categoryId === activeCustomCategoryId)`. Empty state especifico.
  - `SymbolCard` ja funciona com `imageUrl` = `file://...` via `CachedImage` (que passa pelo `getCachedImageUri` — para URIs locais, retornar o URI original sem tocar cache).
  - Favoritar personal symbols segue caminho normal de `toggleFavorite` — pois `SymbolItem` share o mesmo shape.
- `src/services/imageCacheService.ts`: pequeno ajuste em `getCachedImageUri` para tratar URIs locais (`file://` ou sem `http`) como pass-through, se ainda nao fizer.

## Fora de Escopo
- Recorte/crop da imagem alem do que `expo-image-picker` oferece via `allowsEditing: true` (a UI nativa e suficiente, simplicidade).
- Filtros, retoque, compressao avancada alem dos defaults do picker.
- Cores de categoria / icones de categoria.
- Reordenacao de categorias ou de simbolos pessoais (por enquanto ordem e chronological).
- Importacao em lote (apenas um simbolo por vez).
- Compartilhamento de simbolos entre dispositivos.
- Camera customizada com UI propria (usa a UI nativa do picker).

## Arquivos Alvo
- `package.json` (dep `expo-image-picker`)
- `app.json` (plugin + strings de permissao pt-BR)
- `src/types.ts` (tipos novos)
- `src/constants.ts` (`CUSTOM_CATEGORIES_MAX`, `PERSONAL_SYMBOLS_MAX`)
- `src/services/personalSymbolsService.ts` (NOVO)
- `src/services/imageCacheService.ts` (se necessario ajuste pass-through para file://)
- `src/App.tsx` (state, hydrate, persist, UI, handlers)
- `src/__tests__/App.test.tsx` (3 testes: adicionar simbolo da galeria, criar categoria customizada, remover categoria)

## Plano de Implementacao

1. **Dependencia nativa**
   - `npx expo install expo-image-picker` (respeita Expo SDK 54).
   - Adicionar em `app.json` no nivel `expo.plugins`:
     ```
     "plugins": [
       [
         "expo-image-picker",
         {
           "photosPermission": "O Fala usa suas fotos para criar simbolos pessoais.",
           "cameraPermission": "O Fala usa a camera para criar simbolos pessoais.",
           "microphonePermission": false
         }
       ]
     ]
     ```
   - Sem necessidade de rodar prebuild aqui (config plugins; rebuild eh responsabilidade de quem ira empacotar).

2. **Service personalSymbolsService**
   - Criar `src/services/personalSymbolsService.ts`:
     - `import * as FileSystem from 'expo-file-system/legacy'`.
     - Constante `PERSONAL_SYMBOLS_DIR = FileSystem.documentDirectory + 'personal-symbols/'`.
     - `ensureDirectory(): Promise<void>` — cria o diretorio se nao existir.
     - `savePersonalSymbolImage(sourceUri: string): Promise<string>` — gera nome `symbol-<timestamp>-<rand>.<ext>`, copia com `FileSystem.copyAsync`, retorna `destUri`.
     - `deletePersonalSymbolImage(uri: string): Promise<void>` — apenas apaga se estiver dentro de `PERSONAL_SYMBOLS_DIR` (seguranca); silencioso em erro.
     - Exports isolados para testes.

3. **Types**
   - `src/types.ts`: adicionar `PersonalSymbol` e `CustomCategory` conforme escopo.

4. **Constants**
   - `src/constants.ts`: `PERSONAL_SYMBOLS_MAX = 100`, `CUSTOM_CATEGORIES_MAX = 20`.

5. **STORAGE_KEYS**
   - `personalSymbols: 'arasaac_personal_symbols'`
   - `customCategories: 'arasaac_custom_categories'`

6. **State + helpers**
   - `const [personalSymbols, setPersonalSymbols] = useState<PersonalSymbol[]>([])`.
   - `const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])`.
   - `sanitizePersonalSymbols`, `sanitizeCustomCategories` (mesmo estilo dos sanitizers de Phase 13).
   - State adicional:
     - `const [pickerBusy, setPickerBusy] = useState(false)`.
     - `const [pendingSymbolImage, setPendingSymbolImage] = useState<string | null>(null)`.
     - `const [pendingSymbolLabel, setPendingSymbolLabel] = useState('')`.
     - `const [pendingSymbolCategoryId, setPendingSymbolCategoryId] = useState<string | null>(null)`.
     - `const [isSymbolDraftOpen, setIsSymbolDraftOpen] = useState(false)`.
     - `const [newCustomCategoryName, setNewCustomCategoryName] = useState('')`.
     - `const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)`.
     - `const [editingCategoryName, setEditingCategoryName] = useState('')`.

7. **Boot hydration**
   - Adicionar `personalSymbols` e `customCategories` ao Promise.all do boot.
   - Parse defensivo e aplicar sanitize; em erro, manter vazios.

8. **Persistence**
   - `useEffect` para persistir ambos.

9. **Handlers de imagem**
   - `pickFromCamera()`:
     - `ImagePicker.requestCameraPermissionsAsync()`; se negado, toast e abort.
     - `ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: ['images'] })`.
     - Se sucesso, copiar via `savePersonalSymbolImage` e abrir draft modal.
   - `pickFromGallery()`: mesma logica com `launchImageLibraryAsync`.
   - Ambos sao tolerantes a cancelamento (result.canceled) e a erros (toast).
   - Disable botoes enquanto `pickerBusy`.

10. **Draft modal**
    - Modal com:
      - Preview da imagem (`CachedImage` com URI local).
      - TextInput `label` (obrigatorio, 1..40 chars).
      - Chips de categoria (lista de `customCategories` + opcao "Sem categoria").
      - Botao "Salvar" -> cria `PersonalSymbol` com `id: personal-<ts>`, `label`, `categoryId` (ou null), `imageUri`, `createdAt`. Adiciona ao state, fecha modal.
      - Botao "Cancelar" -> apaga imagem copiada via `deletePersonalSymbolImage`, fecha.

11. **Handlers de categorias**
    - `addCustomCategory()`: trim, valida nome nao vazio, dedup case-insensitive, limite `CUSTOM_CATEGORIES_MAX`. Cria `{ id: cat-<ts>, name, createdAt }`.
    - `removeCustomCategory(id)`: set `categoryId` de todos os `personalSymbols` associados para `null`; remove categoria.
    - `startEditCategory(cat)`, `commitEditCategory()`, `cancelEditCategory()`.

12. **Integracao com barra de categorias**
    - Logo apos `Customizados`, renderizar botoes `CategoryButton` para cada `CustomCategory`. Valor de `activeCategory` passa a poder ser `cat-<id>`.
    - `handleCategoryClick`:
      - Se `category.startsWith('cat-')` ou `customCategories.some(c => c.id === category)`: nao chama ARASAAC; apenas seta ativo e reset search.
    - Render na listCard: caso seja uma categoria customizada, `FlatList` de `SymbolCard` filtrado por `personalSymbols.filter(ps => ps.categoryId === activeCategory)`. Empty state.
    - Mapear `PersonalSymbol` para `SymbolItem` ao renderizar: `{ id: ps.id, label: ps.label, imageUrl: ps.imageUri, category: 'personal' }`. Permite `addSymbol` trabalhar normalmente.

13. **Admin editor "Simbolos"**
    - `ConfigSection 'simbolos'`. `ConfigNavItem "Simbolos"` icone `📷`.
    - Layout: 2 botoes grandes ("Tirar foto" / "Da galeria") no topo; abaixo lista de `personalSymbols` com miniatura, rotulo, chip da categoria (ou "Sem categoria"), e botao remover (que chama `deletePersonalSymbolImage` + atualiza state).
    - Mensagem de bloqueio para nao-admin.

14. **Admin editor "Categorias"**
    - `ConfigSection 'categorias'`. `ConfigNavItem "Categorias"` icone `🗂`.
    - Lista de `customCategories` com editor inline e contador de simbolos (quantos `personalSymbols` tem `categoryId === cat.id`).
    - TextInput + botao Adicionar no fundo.
    - Mensagem de bloqueio para nao-admin.

15. **Imagem local no grid**
    - `CachedImage`/`getCachedImageUri`: garantir que URIs que nao comecam com `http` passam direto para `<Image source={{ uri }}>`.
    - Ajuste: se necessario, em `imageCacheService.getCachedImageUri`, retornar `uri` quando `!uri.startsWith('http')`.

16. **Testes**
    - Mock `expo-image-picker`:
      ```
      jest.mock('expo-image-picker', () => ({
        requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
        requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
        launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/fake.jpg' }] })),
        launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/fake.jpg' }] })),
        MediaTypeOptions: { Images: 'Images' }
      }))
      ```
    - Mock `personalSymbolsService`: `savePersonalSymbolImage` retorna `file:///fake-doc-dir/personal-symbols/xxx.jpg`; `deletePersonalSymbolImage` no-op.
    - **Teste 1**: admin cria simbolo da galeria: abrir config -> Simbolos -> tap "Da galeria" -> confirmar preview -> label -> Salvar -> simbolo aparece no grid "Sem categoria" (ou na categoria ativa).
    - **Teste 2**: admin cria categoria custom: abrir config -> Categorias -> adicionar "Casa" -> botao "Casa" aparece na barra.
    - **Teste 3**: remover categoria custom libera simbolos (checa que o simbolo agora aparece em "Sem categoria").

17. **Fechamento**
    - `npm run lint` sem erros.
    - `npm run test -- --runInBand`: 3 testes novos passam; 4 falhas pre-existentes permanecem.
    - `SUMMARY.md` + `STATE.md` atualizados.

## Criterios de Aceite (UAT)
1. Cuidador, no modo admin, tira uma foto e o novo simbolo aparece na grade (via categoria ativa ou em "Meus simbolos"), com rotulo.
2. Cuidador importa uma imagem da galeria e o simbolo resultante e indistinguivel em uso de um simbolo ARASAAC (tap adiciona ao composer, pode ser favoritado).
3. Cuidador cria uma categoria customizada; a categoria aparece na barra de categorias; simbolos pessoais podem ser associados a ela na criacao.
4. Renomear categoria reflete imediatamente na barra; remover categoria nao apaga simbolos — apenas os desassocia (ficam como "Sem categoria").
5. Apos reiniciar o app, simbolos pessoais e categorias customizadas permanecem.
6. `npm run lint` e `npm run test -- --runInBand` sem erros novos.

## Verificacao
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Validacao manual (device necessario para camera):
  - Admin -> Simbolos -> Tirar foto -> confirmar -> grade.
  - Admin -> Categorias -> criar "Casa" -> criar simbolo associado -> barra mostra "Casa" -> selecionar mostra o simbolo.
  - Remover "Casa" -> simbolo permanece sem categoria.
  - Reiniciar -> persistencia.

## Riscos
- Permissoes negadas: usuario desabilita camera/fotos.
- URIs de arquivo local nao resolverem no `<Image>` / `CachedImage` se o cache tratar como remoto.
- `expo-image-picker` versao divergente do Expo SDK 54 gerando warning ou falha de build.
- Deletar arquivo que nao existe (race condition) atirar erro no console.
- Limites de tamanho da imagem copiada (imagens HD sem quality=0.8 podem inflar o FileSystem).

## Mitigacoes
- Tratar `!granted` com toast claro (`Permita o acesso para continuar.`) e abort.
- Ajustar `getCachedImageUri` para pass-through de URIs locais.
- Usar `npx expo install expo-image-picker` (resolve versao compativel automaticamente).
- `deletePersonalSymbolImage` e tolerante: try/catch silencioso.
- `ImagePicker.launchCameraAsync({ quality: 0.8 })` e `allowsEditing: true` forcam crop nativo que ja compacta.

## Dependencias
- Depends on: Phase 12 (vocabulario core concluido), Phase 13 (editor admin consolidado).
- Desbloqueia: Phase 15 (gravacao de audio no editor de simbolo), Phase 16 (rotina visual pode consumir simbolos pessoais).
