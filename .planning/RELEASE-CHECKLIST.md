# RELEASE CHECKLIST

## Build e Qualidade
- [x] `npm run lint` sem erros
- [x] `npm run test` sem falhas
- [ ] Sem segredos hardcoded (chaves/senhas) no codigo fonte

## Validacao Funcional Rapida
- [ ] Buscar simbolos e validar resultados
- [ ] Selecionar simbolos e gerar frase
- [ ] Testar fallback sem chave de IA configurada
- [ ] Testar acao de ouvir voz
- [ ] Validar fluxo admin (login/alteracao senha) no modal de configuracao

## Milestone 3 - Entrada (Phase 10)
- [x] Intro aparece no primeiro acesso
- [x] CTA `Comecar` transiciona para home sem duplo acionamento
- [x] Preferencia `Nao mostrar novamente` persiste entre sessoes
- [x] Abertura direta na home quando `intro_skip_enabled = '1'`
- [x] Fluxo principal e configuracao seguem funcionais apos entrada
- [x] Polimento de contraste/responsividade aplicado na intro

## Validacao de Midia e Performance
- [ ] Confirmar carregamento de imagens apos reabrir app
- [ ] Verificar que cache de imagem continua funcional sem TTL

## Milestone 4 - Comunicacao Pessoal e Rotina Visual
- [x] Vocabulario core pt-BR visivel em todas as telas, editavel no admin (Phase 12)
- [x] Categoria "Frases" com reproducao 1 toque + editor admin (Phase 13)
- [x] Categoria "Historico" auto-alimentada pelo composer e por frases prontas (Phase 13)
- [x] Criar simbolo via camera com rotulo e categoria opcional (Phase 14)
- [x] Criar simbolo via galeria com rotulo e categoria opcional (Phase 14)
- [x] Gerenciador de categorias customizadas (criar/renomear/remover) (Phase 14)
- [x] Gravar voz por simbolo + fallback TTS transparente (Phase 15)
- [x] Long press em simbolo com voz reproduz audio gravado (Phase 15)
- [x] Rotina do dia: editor admin ordenado (ORG-01) (Phase 16)
- [x] Tela de rotina com marcacao de passos concluidos (ORG-02) (Phase 16)
- [x] Progresso de rotina reseta automaticamente entre dias (Phase 16)

## Regressao Final Milestone 4
- [ ] Composer: selecionar simbolos, gerar com IA, ouvir, deletar
- [ ] Barra de vocabulario core: tap adiciona palavra a selecao
- [ ] Categorias ARASAAC carregam ao selecionar
- [ ] Busca de simbolos (admin) retorna resultados
- [ ] Favoritos: toggle persiste
- [ ] Categorias customizadas aparecem na barra, filtram simbolos pessoais
- [ ] Simbolos pessoais tocam TTS via composer (sem audio gravado)
- [ ] Simbolos pessoais com audio tocam gravacao via long press
- [ ] Frases prontas: tap fala, editor admin adiciona/edita/remove
- [ ] Historico: frase falada aparece no topo, tap refala
- [ ] Rotina: criar/remover passos, marcar concluido, persistencia diaria
- [ ] Admin: login/criar senha/trocar senha, chave IA

## Preparacao de Entrega
- [x] Atualizar docs/estado da milestone
- [x] Revisar changelog ou resumo de mudancas
- [ ] Garantir `.env.example` atualizado
