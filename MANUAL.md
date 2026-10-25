# Fala Mobile — Manual rápido

## Desenvolvimento Android no Windows

Use JDK 17, o SDK Android e um dispositivo iniciado no Device Manager do Android Studio.
Defina `JAVA_HOME` para a pasta do JDK 17 (não para `bin`).
Se `JAVA_HOME` não estiver definido, o comando procura um JDK 17 em
`%LOCALAPPDATA%\FalaMobile\toolchain\jdk-17*` e, como alternativa, em
`.expo/toolchain/jdk-17*`. Prefira o primeiro caminho para evitar acentos no Java.

- `npm.cmd run android:prepare`: gera os arquivos Android sem compilar.
- `npm.cmd run android`: compila e instala no emulador ou aparelho conectado.

Esses scripts usam `scripts/expo-android.cjs`, que contorna uma falha na cópia recursiva
do Node no Windows quando o caminho contém acentos. Use os scripts npm em vez de
chamar `expo prebuild` diretamente nesse ambiente. O ajuste vale apenas para o processo
do Expo e não altera `node_modules` nem a configuração global do Node.

Ao compilar em um caminho com acentos, o comando sincroniza uma cópia de compilação
em `C:\FalaBuild\<identificador-do-projeto>` (na unidade do Windows). O caminho curto
evita o limite de 260 caracteres das ferramentas C++. Código e dependências são copiados;
Git, arquivos `.env`, credenciais e builds anteriores ficam fora. O projeto original
permanece no mesmo lugar. O Java recebe a opção UTF-8 para ler os caminhos corretamente.

Para acompanhar edições nesta pasta durante o teste, mantenha `npm.cmd start` em
um terminal e use `npm.cmd run android -- --no-bundler` em outro. A instalação
conecta ao servidor na porta 8081. Mudanças nativas exigem executar o comando Android
novamente para sincronizar e recompilar a cópia.

Se outras ferramentas nativas rejeitarem o caminho com acentos, use uma cópia de trabalho
em um caminho curto fora do OneDrive, como `C:\dev\fala`.

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

### Baixar categorias para usar sem internet

Nas configurações, entre como cuidador e abra **Categorias offline**. Toque em
**Baixar categoria** para salvar todos os símbolos exibidos naquela categoria.
Prefira Wi-Fi e mantenha a tela aberta. O progresso mostra as imagens salvas;
ao concluir, aparece **Disponível offline**, junto com o espaço ocupado.

Você pode pausar e continuar depois. Se a conexão falhar, **Continuar download**
baixa apenas as imagens que faltam. Os arquivos ficam no aparelho, fora do cache
temporário, e não aumentam o APK. **Remover download** libera esse espaço;
os símbolos essenciais incluídos no app continuam disponíveis. Estes downloads
não fazem parte do backup: em outro aparelho, baixe as categorias novamente.

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
Configurável em Cuidador → Chave da IA. Sem chave, o botão "Gerar" concatena as palavras sem normalização. A chave é guardada no armazenamento seguro do aparelho; chaves antigas salvas no AsyncStorage são migradas no primeiro uso da IA. Variáveis `EXPO_PUBLIC` não são mais usadas para credenciais. Quem configurava a chave apenas pelo `.env` deve inseri-la nos ajustes. Salvar uma chave vazia desativa a IA.

Respostas pendentes são descartadas quando a frase é editada, limpa ou substituída. A geração pede que a intenção e as negações sejam preservadas; a frase continua editável antes de ser falada.

## Backup e restauração

Em **Cuidador → Backup e restauração**, use **Exportar backup** e escolha onde guardar o arquivo. Ele inclui configurações, favoritos, frases, histórico, símbolos pessoais, fotos, áudios, rotinas e cenas. Senha do cuidador e chave da IA ficam fora do arquivo.

Para trocar de aparelho, transfira o arquivo, entre como cuidador no novo aparelho e escolha **Importar backup**. A confirmação informa que os dados atuais serão substituídos. As mídias são copiadas para o armazenamento do novo aparelho. Uma restauração interrompida recupera a configuração anterior na próxima abertura.

O arquivo não é criptografado: guarde-o em um destino de confiança. Limites: 40 MB de mídias e 64 MB para o arquivo completo. O cache geral de pictogramas não é incluído; pictogramas adicionais podem precisar de internet após a troca de aparelho. A exportação falha com uma mensagem se algum arquivo pessoal estiver ausente, em vez de criar uma cópia incompleta.

## Primeira abertura sem internet

O app inclui 16 pictogramas básicos, com imagens e rótulos em português brasileiro. Sem favoritos cadastrados, inicia na aba Tudo. As buscas e categorias carregadas com sucesso são guardadas entre sessões. Falhas de rede não são salvas como resultados vazios permanentes.

A voz sintetizada depende das vozes disponíveis no sistema do aparelho. Valide a reprodução em modo avião; áudios gravados ficam locais.

---

## Acessibilidade

- **Alto contraste** — paleta escura com textos amarelos para baixa visão
- **Feedback visual** — destaque ao tocar (toggle pra desativar quando incomoda hipersensibilidade visual)
- **Escala da interface** — três níveis ajustam toda a UI proporcionalmente
- **Imagens por linha** — 2/3/4 colunas; 2 colunas dá símbolos enormes
- **Haptic feedback** — vibração leve em toques principais (iOS; ignorado em plataformas sem haptics)

---

## Persistência

Dados de comunicação e preferências são salvos localmente via AsyncStorage e FileSystem; a chave da IA usa o armazenamento seguro do sistema. Busca de pictogramas novos e geração de frases por IA exigem internet.
- Configurações (voz, escala, contraste, senha admin)
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
