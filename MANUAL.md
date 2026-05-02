# Fala Mobile — Manual rápido

App AAC (comunicação aumentativa) em pt-BR para crianças autistas. Símbolos ARASAAC, voz, fotos pessoais, rotina visual e cenas com hotspots. Tudo offline-first com cache local.

---

## Tela principal

A tela é dividida em (de cima pra baixo): cabeçalho com botão Cuidador, busca, **barra de categorias**, **grade de símbolos**, **faixa de vocabulário core**, e o **composer** (frase + botões).

### Composer (montar e falar frase)
- **Tocar num símbolo** da grade → adiciona à frase
- **Gerar (IA)** → normaliza a sequência de palavras numa frase em pt-BR (ex: "quero água" → "Eu quero água, por favor")
- **Ouvir** → fala a frase com TTS pt-BR (rate/pitch ajustáveis no Cuidador)
- **Limpar** → esvazia o composer
- A frase falada é registrada no **Histórico**

### Vocabulário core (faixa fixa)
Palavras essenciais sempre visíveis na mesma posição (motor planning). Padrão: *quero, não, sim, mais, parar, ajuda, mãe, pai*. **Tocar adiciona ao composer.** Editável no Cuidador.

---

## Categorias (barra horizontal)

| Categoria | O que mostra |
|---|---|
| **Favoritos** | Símbolos marcados com a estrela (overlay no card) |
| **Tudo** | Todos os símbolos mais usados (ARASAAC) |
| **[categorias ARASAAC]** | Filtro por categoria pré-existente |
| **Frases** | Frases prontas (ver abaixo) |
| **Histórico** | Últimas frases faladas |
| **Rotina** | Rotina do dia (visual-first, ver abaixo) |
| **Cenas** | Cenas visuais com hotspots (ver abaixo) |
| **[categorias customizadas]** | Símbolos pessoais agrupados pelo cuidador |

---

## Frases Prontas

- **Tocar numa frase** → fala imediatamente, em um toque
- Editor admin: adicionar / remover / reordenar
- Persistem entre sessões

## Histórico

- Frases ditas via composer aparecem automaticamente no topo
- **Tocar refala** a frase
- Sem edição manual; é alimentado pelo uso

---

## Rotina do Dia (visual-first)

Sequência ordenada de passos com **imagem dominante**, número da etapa e narração ao tocar.

**Visualização da criança:**
- Card grande com imagem ocupando a maior parte
- Badge azul numerado (1, 2, 3…) no canto superior esquerdo
- Badge 🔊 no canto superior direito se o passo tem voz gravada
- **Tocar** → marca como concluído + narra o passo (TTS ou voz gravada)
- **Segurar (long-press)** → só ouve, sem marcar
- Quando concluído: overlay verde com ✓ grande
- Progresso reseta automaticamente todo dia

**Editor admin (Cuidador → Rotina):**
- Adicionar passo via:
  - **★ Símbolo** — escolhe de símbolos pessoais ou favoritos
  - **📷 Câmera** — tira foto na hora
  - **🖼 Galeria** — seleciona foto existente
- Cada passo tem nome (texto curto) — usado pra narração TTS
- Setas ↑ ↓ pra reordenar, ✕ pra remover
- "Zerar progresso do dia" pra reiniciar manualmente

---

## Cenas Visuais

Foto de um ambiente (cozinha, quarto) com **marcadores tocáveis** sobre objetos. A criança toca num objeto e ouve o nome.

**Visualização da criança:**
- Categoria "Cenas" → grid 2 colunas com as cenas disponíveis
- Tocar abre a foto em tela cheia
- Cada item marcado tem um círculo azul translúcido com pontinho central
- **Tocar no círculo** → fala o nome (voz gravada se houver, senão TTS) + haptic feedback
- "Fechar" no canto superior esquerdo

**Editor admin (Cuidador → Cenas):**
1. **📷 Nova foto** ou **🖼 Da galeria** abre o editor
2. Dá um nome à cena (ex: "Cozinha")
3. **Tocar diretamente na foto** → cria um marcador numerado naquele ponto
4. Cada marcador tem:
   - Nome (ex: "prato") — obrigatório
   - **● Gravar / ■ Parar** — voz do cuidador opcional (sobrepõe TTS)
   - **✕** — remove o marcador
5. "Salvar" no header — cena vai pra grade da criança

Limite: 20 cenas, 12 marcadores por cena.

---

## Símbolos Pessoais

Fotos do círculo familiar / objetos da casa, com rótulo e voz gravada opcional.

**Criação (Cuidador → Símbolos):**
- **📷 Câmera** ou **🖼 Galeria** → preview inline → preencher rótulo → opcional: gravar voz → "Salvar"
- Categoria opcional (custom) na criação

**Uso pela criança:**
- Aparecem na grade junto aos ARASAAC quando categoria customizada está ativa
- **Tocar curto** → adiciona ao composer (TTS quando "Ouvir")
- **Segurar (long-press)** com ícone 🔊 → reproduz a voz gravada do cuidador

## Categorias Customizadas

Cuidador → Categorias: criar / renomear / remover. Cada símbolo pessoal pode ser atribuído a uma categoria customizada (vira filtro extra na barra).

---

## Modo Cuidador (admin)

Acesso pelo botão ⚙ no header.

- Primeiro acesso → criar senha
- Acessos seguintes → digitar senha (hash FNV-variant; nunca em texto puro)
- "Sair" para voltar ao modo criança

### Seções do Cuidador

| Seção | O que faz |
|---|---|
| **Cuidador** (segurança) | Trocar senha, sair |
| **Voz** | Velocidade (rate) e tom (pitch) do TTS |
| **Acessibilidade** | Modo alto contraste, feedback visual ao toque |
| **Perfil** | Escala da interface (compacto/padrão/confortável), imagens por linha (2/3/4) |
| **Vocabulário** | Editar a faixa de palavras-núcleo |
| **Frases** | Adicionar/editar frases prontas |
| **Símbolos** | Criar e editar símbolos pessoais (câmera/galeria/voz) |
| **Categorias** | Categorias customizadas |
| **Rotina** | Editar passos da rotina do dia |
| **Cenas** | Criar e editar cenas visuais |

### Chave IA (opcional)
Configurável em Cuidador → Voz/Geral. Sem chave, o botão "Gerar" funciona em modo degradado (concatena palavras sem normalização). Variáveis aceitas em prioridade:
1. `EXPO_PUBLIC_GOOGLE_AI_API_KEY` (env)
2. `EXPO_PUBLIC_GOOGLE_API_KEY` (env)
3. Chave salva no app

---

## Acessibilidade

- **Alto contraste** — paleta escura com textos amarelos para baixa visão
- **Feedback visual** — destaque ao tocar (toggle pra desativar quando incomoda hipersensibilidade visual)
- **Escala da interface** — três níveis ajustam toda a UI proporcionalmente
- **Imagens por linha** — 2/3/4 colunas; 2 colunas dá símbolos enormes
- **Haptic feedback** — vibração leve em toques principais (iOS; ignorado em plataformas sem haptics)

---

## Persistência

Tudo offline. Salvo localmente via AsyncStorage e FileSystem:
- Configurações (voz, escala, contraste, senha admin, chave IA)
- Favoritos, frases prontas, histórico
- Vocabulário core
- Símbolos pessoais (imagem em disco) + voz gravada (áudio em disco)
- Categorias customizadas
- Rotina e progresso diário (reset automático no dia seguinte)
- Cenas visuais (foto em disco) + voz dos hotspots (áudio em disco)

Cache de imagens ARASAAC é LRU 300MB → 240MB target, reaproveita entre sessões.

---

## Limites

| Item | Máximo |
|---|---|
| Vocabulário core | 12 palavras |
| Frases prontas | 30 |
| Histórico | 20 (rotativo) |
| Símbolos pessoais | 100 |
| Categorias customizadas | 20 |
| Passos de rotina | 30 |
| Cenas visuais | 20 |
| Marcadores por cena | 12 |
