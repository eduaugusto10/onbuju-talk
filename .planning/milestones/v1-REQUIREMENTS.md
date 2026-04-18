# REQUIREMENTS ARCHIVE - v1

## Escopo
- [x] Evolucao e estabilizacao do app Fala Mobile ja migrado para React Native/Expo.

## Requisitos Funcionais
- [x] RF1 - Permitir pesquisar simbolos ARASAAC por texto. (validado)
- [x] RF2 - Permitir navegacao por categorias e favoritos. (validado)
- [x] RF3 - Permitir montar frase por selecao de simbolos. (validado)
- [x] RF4 - Permitir ouvir frase com TTS em pt-BR. (validado)
- [x] RF5 - Permitir salvar e excluir grupos customizados (admin). (validado)
- [x] RF6 - Persistir favoritos, grupos e ajustes de voz localmente. (validado)
- [x] RF7 - Exibir feedback de erro/sucesso via toast. (validado)
- [x] RF8 - Melhorar carregamento de imagens via cache local em disco. (validado)

## Requisitos Nao Funcionais
- [x] RNF1 - Compativel com Expo SDK 54 e Expo Go atual. (validado)
- [x] RNF2 - Interface legivel em telas menores, sem corte de texto/botoes. (validado)
- [x] RNF3 - App funcional com conectividade intermitente para itens cacheados. (validado)
- [x] RNF4 - Build e type-check sem erros (`npm run lint`). (validado)

## Fora de Escopo (agora)
- [x] Backend proprio. (mantido fora de escopo)
- [x] Sistema robusto de autenticacao admin. (ajustado para modo admin local)
- [x] Internacionalizacao multilingue completa. (mantido fora de escopo)
- [x] Suite completa de testes E2E. (mantido fora de escopo)

## Criterios de Aceite
- [x] Fluxo buscar -> selecionar -> gerar -> ouvir funciona sem crash.
- [x] Cache de imagem reduz latencia de reabertura de listas.
- [x] Estado persistido mantem dados apos reiniciar o app.
- [x] UX principal nao apresenta elementos quebrados em listas vazias/curtas.
