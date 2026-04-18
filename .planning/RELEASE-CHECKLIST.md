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

## Preparacao de Entrega
- [x] Atualizar docs/estado da milestone
- [x] Revisar changelog ou resumo de mudancas
- [ ] Garantir `.env.example` atualizado
