# REQUIREMENTS - Milestone v4

**Milestone:** v4 - Comunicacao Pessoal e Rotina Visual
**Goal:** Evoluir o Fala Mobile de um montador de frases para uma ferramenta de comunicacao diaria personalizada, com vocabulario estavel, conteudo familiar (fotos e voz do cuidador) e rotinas visuais.
**Publico-alvo:** criancas autistas; restricao dura de simplicidade sobre riqueza de features.

---

## v4 Requirements

### Comunicacao e Vocabulario (COMM)

- [ ] **COMM-01**: Usuario acessa um conjunto fixo de palavras-nucleo (quero, nao, sim, mais, parar, ajuda, mae, pai) sempre na mesma posicao da tela, independente de navegacao entre categorias.
- [ ] **COMM-02**: Cuidador configura quais palavras compoem o vocabulario core e em qual ordem, com um conjunto padrao pre-instalado em pt-BR.
- [ ] **COMM-03**: Usuario acessa um banco de frases prontas (ex.: "quero banheiro", "estou com fome", "me ajuda") e reproduz a frase com um unico toque.
- [ ] **COMM-04**: Cuidador adiciona, edita e remove frases no banco de frases prontas.
- [ ] **COMM-05**: Usuario ve o historico das ultimas frases faladas e reutiliza qualquer uma com um toque.

### Conteudo Pessoal (CONT)

- [ ] **CONT-01**: Cuidador tira uma foto com a camera do dispositivo e cria um simbolo personalizado a partir dela, com rotulo e categoria opcionais.
- [ ] **CONT-02**: Cuidador importa uma imagem da galeria do dispositivo e cria um simbolo personalizado a partir dela.
- [ ] **CONT-03**: Cuidador grava um trecho de audio (voz) e associa ao simbolo para reproducao no lugar do TTS.
- [ ] **CONT-04**: Usuario escuta a voz gravada do cuidador ao selecionar o simbolo, com fallback para TTS quando nao houver gravacao.

### Organizacao Visual (ORG)

- [ ] **ORG-01**: Cuidador monta uma rotina visual como sequencia ordenada de simbolos (ex.: acordar, escovar dentes, tomar cafe, ir para escola).
- [ ] **ORG-02**: Usuario visualiza a rotina do dia em tela dedicada e marca cada passo como concluido conforme avanca.
- [ ] **ORG-03**: Cuidador cria, renomeia e remove categorias customizadas, e associa simbolos a essas categorias.

---

## Future Requirements (Deferred)

Features avaliadas para v4 mas adiadas para milestones futuras:

- **Predicao contextual por IA de proximo simbolo** - ROI incerto para o publico-alvo; historico de frases (COMM-05) entrega boa parte do valor.
- **Visual scene display** - cena fotografica com regioes tocaveis; avaliar apos validacao de simbolos pessoais.
- **Historias sociais** - narrativas ilustradas sequenciais; rotinas (ORG-01/02) cobrem caso de uso principal primeiro.
- **Boards contextuais por horario/local** - complexidade alta para beneficio incremental.
- **Niveis progressivos de vocabulario** - camada de complexidade que conflita com restricao de simplicidade.

## Out of Scope

Features explicitamente fora do escopo com justificativa:

- **Tamanhos de grade alem de 2-5 colunas** - ja cobertos pela funcionalidade atual; ampliar nao agrega.
- **Multiplos perfis de usuario no mesmo dispositivo** - fora do escopo da v4; considerar se houver demanda validada.
- **Backup/sincronizacao em nuvem** - fora do escopo; app permanece local-first por ora.
- **Dashboard de terapeuta / relatorios de uso** - fora do escopo da v4.
- **Switch access / varredura por 1 botao** - fora do escopo; considerar em milestone futura de acessibilidade.
- **Integracoes externas (WhatsApp, Wear OS, widget)** - fora do escopo.

---

## Traceability

| REQ-ID   | Category                     | Phase    | Notes                                         |
|----------|------------------------------|----------|-----------------------------------------------|
| COMM-01  | Comunicacao e Vocabulario    | Phase 12 | Faixa fixa de vocabulario core                |
| COMM-02  | Comunicacao e Vocabulario    | Phase 12 | Editor de vocabulario core + padrao pt-BR     |
| COMM-03  | Comunicacao e Vocabulario    | Phase 13 | Banco de frases prontas, reproducao 1 toque   |
| COMM-04  | Comunicacao e Vocabulario    | Phase 13 | Editor de frases prontas no modo admin        |
| COMM-05  | Comunicacao e Vocabulario    | Phase 13 | Historico de frases recentes                  |
| CONT-01  | Conteudo Pessoal             | Phase 14 | Criacao de simbolo via camera                 |
| CONT-02  | Conteudo Pessoal             | Phase 14 | Criacao de simbolo via galeria                |
| CONT-03  | Conteudo Pessoal             | Phase 15 | Gravacao de audio do cuidador                 |
| CONT-04  | Conteudo Pessoal             | Phase 15 | Reproducao da voz gravada com fallback TTS    |
| ORG-01   | Organizacao Visual           | Phase 16 | Editor de rotina visual                       |
| ORG-02   | Organizacao Visual           | Phase 16 | Tela de rotina do dia com marcacao de passos  |
| ORG-03   | Organizacao Visual           | Phase 14 | Categorias customizadas (partilha picker infra)|

---

**Total:** 12 requirements | **Categorias:** 3 | **Status:** roadmap criado, aguardando planejamento da Phase 12
