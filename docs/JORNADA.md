# Jornada TestoMAX: decisões e validação

## Análise do ponto de partida

A aplicação original já possuía componentes acessíveis, navegação responsiva, service worker, preferências e atividades/refeições locais. Os problemas principais eram oito atividades pouco priorizadas, protocolos repetidos para poucos dias, cinco fases sem avanço real, ausência de mapa/XP/restrições, seis refeições repetidas por dieta e uma lista que precisava ser regenerada manualmente. Não havia autenticação ou backend ativo.

## Decisões assumidas

1. A jornada nova começa na data local do onboarding ou da migração. O histórico existente não estabelece uma data retroativa nem gera dívida de tarefas.
2. Quatro missões por dia: organização/bem-estar, movimento ou recuperação, planejamento alimentar e descanso. A missão alimentar planeja a alimentação; o preparo das receitas tem tempo separado. Não é um plano de exercício clínico ou de hipertrofia.
3. O orçamento classifica receitas por ingredientes comuns, sem simular preços. Receitas com ingredientes já cozidos têm tempo de finalização, com essa dependência explícita.
4. A meta inicial é quatro dias de participação por semana, editável entre um e sete. A semana é segunda a domingo.
5. Conquistas são permanentes após alcançadas, inclusive após desfazer uma conclusão. XP acompanha o estado atual das missões, sem créditos cumulativos por alternar marcações.
6. O filtro de ingredientes adicionais usa a lista controlada do catálogo. Alergênicos são extraídos de seus ingredientes. Aveia é tratada conservadoramente como possível fonte de glúten. A composição real de produtos e a contaminação cruzada exigem checagem dos rótulos.
7. Refeições registradas antes de uma mudança de restrição permanecem identificadas como histórico. Não entram na lista de compras se incompatíveis com as restrições atuais.
8. As receitas são conteúdo editorial geral, sem validação profissional alegada. O catálogo precisa de revisão nutricional e culinária antes de ser oferecido como orientação profissional.

## Roteiro de validação manual

1. Em um perfil de navegador de teste, entrar e completar o onboarding. Voltar uma etapa para confirmar que as escolhas permanecem. Selecionar objetivo alimentação, 10 minutos de missões, alimentação vegana, soja a evitar e preparos até 10 minutos.
2. Conferir o resumo, iniciar, abrir “Por que essa rotina?” e confirmar a próxima ação alimentar. Revisar horários, duração e alternativa nos detalhes.
3. Concluir uma missão, recarregar, desfazer e concluir novamente. O saldo deve voltar aos mesmos 10 XP. A conquista do primeiro passo permanece.
4. Concluir as quatro missões. O dia seguinte deve continuar bloqueado. Abrir o mapa, explorar outro capítulo e consultar a prévia do dia 120.
5. Para testar calendário sem esperar, usar os testes Playwright com relógio controlado. Não alterar relógio ou armazenamento de usuários reais. A liberação deve ocorrer à meia-noite no fuso do perfil, inclusive em viradas UTC e DST.
6. Gerar compras para sete dias, adicionar item pessoal, trocar uma refeição de amanhã e voltar às compras. Conferir alterações de ingredientes, quantidades e preservação do item pessoal; recarregar.
7. Mudar preferências e confirmar que registros concluídos e data inicial permanecem. Conferir que novas sugestões respeitam restrições. Combinações sem receitas devem mostrar um aviso, sem relaxar alergias.
8. Testar migração com uma cópia da estrutura antiga, confirmando backup, registros antigos no histórico e aviso de transição. Após uma ausência simulada, acessar diretamente o dia atual.
9. Conferir teclado, foco do modal, toque, larguras 320/390/844/1280/1440 e preferência de movimento reduzido.
10. Executar o build e `scripts/verify-production.mjs` com o preview na porta 4173 para testar recarregamento e navegação offline, service worker e persistência.

## Integração futura necessária para contas

O armazenamento local não fornece identidade autenticada, relógio confiável nem sincronização. Para atender a associação de progresso por conta em um serviço multiusuário, conectar autenticação real e migrar o repositório para um backend. Esse trabalho não foi simulado nesta entrega.

No backend, persistir início, fuso, preferências, conclusões únicas por usuário/dia/missão e conquistas. Aplicar autorização por usuário e bloqueio de datas em operações transacionais do servidor; derivar XP do estado das conclusões, usando relógio confiável. Preservar importação explícita do histórico local por proprietário e definir política de sincronização offline/conflitos. Os scripts e migrações Supabase antigos não implementam esse contrato novo e não foram ativados.

Sem backend, a regra centralizada impede a conclusão antecipada pelos fluxos normais e pelas operações do repositório, mas armazenamento e relógio locais permanecem alteráveis pelo dono do navegador. A alteração de fuso segue a data civil do fuso escolhido; a data de início é preservada. O maior dia já liberado é persistido, para que mudar para um fuso com data anterior não volte a bloquear protocolos nem retire XP registrado.

## Referências editoriais, consultadas em 17/10/2026

- [Ministério da Saúde — Guias Alimentares](https://www.gov.br/saude/pt-br/composicao/saps/promocao-da-saude/guias-alimentares): referência geral para organização e variedade alimentar. Não é validação do catálogo de receitas.
- [FDA — Food Allergies](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies): leitura de rótulos e distinção entre ingredientes e contato cruzado.
- [FoodSafety.gov — Safe Minimum Internal Temperatures](https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures): referência da temperatura de preparo de peixe indicada no catálogo.

Não foram incluídas promessas hormonais, diagnósticos, tratamentos, suplementação, estudos inventados ou pontuação apresentada como resultado fisiológico.
