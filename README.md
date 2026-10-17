# TestoMAX · Jornada de 120 dias

PWA em português para construir hábitos de alimentação, movimento, sono e bem-estar. Mantém React 19, TypeScript, Vite, Tailwind, componentes Radix/shadcn, React Router e TanStack Query do projeto original.

## Executar e verificar

Node.js 22.12+ ou 24 LTS:

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam Chromium. Se ele não estiver instalado, use um navegador local compatível, por exemplo no PowerShell: `$env:PLAYWRIGHT_CHANNEL='msedge'`. O teste de PWA em produção usa `npm run preview -- --port 4173` e, em outro terminal, `node scripts/verify-production.mjs`.

## Experiência implementada

- Onboarding com uma pergunta por etapa, voltar, progresso e resumo antes de iniciar. As respostas podem ser editadas no perfil.
- Quatro capítulos de 30 dias: Despertar, Construir a base, Ganhar consistência e Consolidar. Cada capítulo tem objetivo, símbolo, cor, marcos e prévia.
- 120 protocolos editoriais, com quatro missões por dia, duração, instruções, propósito e alternativa. O tempo diário é um teto; a experiência e o local adaptam o movimento sem progressão automática de intensidade.
- Hoje apresenta capítulo, foco, próxima ação prioritária conforme o objetivo, missões, meta semanal e próxima liberação.
- Mapa com 30 pontos por capítulo, navegação direta entre capítulos, salto para hoje e prévias acessíveis dos dias futuros.
- 10 XP por missão marcada; desfazer remove os mesmos pontos. Níveis a cada 200 XP e nove conquistas persistentes, sem ranking nem indicadores hormonais.
- Meta editável de dias com ao menos uma missão, resumo da semana corrente e da última semana encerrada, histórico completo.
- 64 receitas completas, 30 combinações-base de cardápios distribuídas nos 120 dias e planejamento antecipado da próxima semana.
- Filtros por estilo alimentar, grupos de alergênicos, ingredientes evitados, orçamento e tempo de cozinha. Sem alternativas compatíveis, o app mostra um estado vazio e mantém as restrições.
- Trocas de refeições compatíveis e recálculo da lista gerada, preservando itens pessoais. Se a quantidade necessária aumentar, o ingrediente volta a ficar pendente.
- Navegação Hoje, Jornada, Alimentação e Progresso, com perfil no cabeçalho móvel. PWA e registros locais disponíveis offline, foco de teclado, estados textuais e movimento reduzido.

## Regras e persistência

O dia 1 começa na data local do término do onboarding. O próximo dia abre à meia-noite no fuso salvo no perfil. Concluir missões não antecipa datas; faltas não bloqueiam dias. Os 120 protocolos ficam acessíveis depois da data final. Refeições podem ser consultadas e trocadas antecipadamente; o registro de consumo só abre na respectiva data.

As regras estão centralizadas em `src/domain/journey.ts` e são aplicadas também no repositório local, não apenas nos botões. XP é derivado dos registros atuais; conquistas registram marcos alcançados e não são revogadas por faltas ou por desfazer. Refeições e registros anteriores à jornada não dão XP.

A versão anterior não tinha contas nem autenticação individual: usava um botão de entrada e um único perfil no navegador. Esse acesso foi preservado. `src/services/repository.ts` continua conectado ao armazenamento local; os arquivos Supabase existentes são históricos e **não representam uma integração ativa**. Não há sincronização entre dispositivos nem associação a uma conta remota. Pessoas compartilhando o mesmo perfil do navegador compartilham o espaço local.

A chave existente `testomax:local-workspace:v1` é mantida. Dados antigos ganham os novos campos via schema, sem apagar atividades, refeições registradas ou itens pessoais. Antes da migração, a cópia original é guardada em `testomax:before-journey:v1`. A nova jornada começa no dia da migração, sem converter o histórico antigo em tarefas atrasadas. A tela explica a transição e oferece edição das preferências. Sair não apaga dados; limpar os dados do navegador os remove.

Alterações de preferências adaptam missões e refeições ainda não registradas do presente/futuro. Preservam datas, conclusões, conquistas e histórico anterior. A persistência local é validada por schema, serializada entre abas via Web Locks quando disponível, e erros de gravação oferecem repetição.

## Organização e manutenção

- `src/domain/types.ts`: schemas e modelos tipados.
- `src/domain/journey.ts`: calendário, estados, XP e conquistas.
- `src/content/journey.ts`: capítulos, 120 focos editoriais e missões adaptáveis.
- `src/content/recipes.ts`: ingredientes, alergênicos e 64 receitas.
- `src/domain/nutrition.ts`: compatibilidade, cardápios e seleção de receitas.
- `src/demo/repository.ts`: nome de pasta herdado; implementação da persistência real deste aplicativo local.
- `tests/journey.test.ts`: calendário/fuso/DST, migração, ausência, conteúdo, filtros, XP e compras.
- `tests/e2e/`: onboarding, persistência, calendário, refeições, erros de gravação, acessibilidade e telas pequenas.
- `docs/JORNADA.md`: decisões, roteiro de validação e limites para a próxima integração.

A hospedagem existente está identificada em `.openai/hosting.json`. O build estático sai em `dist`; requer HTTPS e fallback SPA.
