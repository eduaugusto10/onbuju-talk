# REQUIREMENTS ARCHIVE - v3

## Escopo
- [x] Implementar uma experiencia de abertura com orientacao rapida, sem comprometer performance e fluxos atuais. (validado)

## Requisitos Funcionais
- [x] RF1 - Exibir tela inicial ao abrir o app, antes da tela principal. (validado)
- [x] RF2 - Apresentar identidade do produto e mensagem curta de orientacao. (validado)
- [x] RF3 - Permitir continuar para a tela principal com acao clara (`Comecar`). (validado)
- [x] RF4 - Permitir opcao de pular em futuras aberturas com preferencia persistida. (validado)
- [x] RF5 - Manter fluxo atual (buscar, selecionar, gerar, ouvir, salvar, configuracao) funcional apos introducao da tela inicial. (validado)
- [x] RF6 - Permitir ajustar quantidade de imagens por linha em configuracoes, com adaptacao responsiva do grid. (ajustado e validado na Phase 11)

## Requisitos Nao Funcionais
- [x] RNF1 - Tempo adicional de abertura pequeno e sem travamentos perceptiveis. (validado)
- [x] RNF2 - Compatibilidade iOS e Android sem regressao visual relevante. (validado com risco residual visual manual)
- [x] RNF3 - Interface da tela inicial com legibilidade e contraste adequados. (validado)
- [x] RNF4 - `npm run lint` e `npm run test` sem erros. (validado)

## Fora de Escopo (agora)
- [x] Sistema completo de onboarding com multiplas etapas. (mantido fora de escopo)
- [x] Conteudo remoto dinamico na tela inicial. (mantido fora de escopo)
- [x] Reescrita de arquitetura ou navegacao global. (mantido fora de escopo)

## Criterios de Aceite
- [x] Tela inicial aparece na abertura e permite seguir para uso principal.
- [x] Preferencia de pular tela inicial persiste corretamente entre sessoes.
- [x] Fluxos principais continuam funcionais apos entrada na home.
- [x] Sem regressao relevante em layout iOS/Android.
- [x] Lint e testes passam ao final da milestone.
