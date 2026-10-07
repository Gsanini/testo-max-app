# TestoMAX

PWA em português para organizar atividades, alimentação, sono e hábitos. Interface escura, responsiva, com navegação inferior no celular e lateral no notebook. Os controles, formulários, gráficos e listas são componentes reais.

## Executar

Use Node.js 22.12+ ou 24 LTS e npm. A versão usada na validação foi Node 24.14.0. As versões resolvidas estão em `package-lock.json`.

```bash
npm ci
npm run dev
```

Abra a URL mostrada pelo Vite. Sem credenciais, o botão **Explorar demonstração** aparece **somente no servidor de desenvolvimento**. Há dados de exemplo identificados, e os registros começam zerados. Conclusões, preferências, refeições e compras ficam salvos no navegador. Sair da demonstração limpa esse estado.

A demonstração não é uma forma de autorização: `import.meta.env.DEV` impede seu carregamento no build de produção. Alterar `localStorage`, `sessionStorage` ou `VITE_ENABLE_DEMO` não libera o produto em produção.

## Stack e organização

- React 19, TypeScript strict e Vite 8.
- Tailwind CSS 4; componentes shadcn/ui Button e Dialog adaptados, com primitivas Radix e foco acessível.
- Lucide React, React Router 7, TanStack Query 5.
- React Hook Form, Zod e validação dos dados retornados pelo backend.
- Supabase Auth, PostgreSQL com RLS e Edge Function para pagamentos.
- Manifest e service worker próprio, gerado a partir dos arquivos do build.

```text
src/app/           rotas, sessão, autorização e estado remoto
src/components/    componentes compartilhados e ui/shadcn
src/domain/        modelos, datas, progresso e consolidação de ingredientes
src/features/      telas de hoje, protocolos, alimentação, progresso, perfil, auth e PWA
src/services/      cliente Supabase e repositório tipado/validado
src/demo/          adaptador e conteúdo exclusivos de desenvolvimento
src/styles.css    tokens e estilos responsivos
supabase/         migrations, conteúdo ilustrativo opcional, configuração e webhook
tests/            regras de negócio, políticas PostgreSQL, assinaturas e navegador
scripts/          PWA, ícones/fotos, concessão administrativa e validação de produção
```

## Conectar o Supabase

1. Crie um projeto Supabase. Copie `.env.example` para `.env.local`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a URL e a chave **pública/anon**. Nunca coloque uma chave `service_role` ou `sb_secret_…` em variáveis `VITE_`.
3. Aplique, em ordem, os SQLs de `supabase/migrations/` pelo SQL Editor do projeto, ou use a CLI:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

4. Em Authentication, habilite e-mail/senha e **desabilite o cadastro público**. Contas são convidadas pelo administrador. Uma conta, sozinha, não recebe acesso ao produto.
5. Configure Site URL e URLs de redirecionamento permitidas: `https://SEU_DOMINIO/definir-senha` e os endereços locais de desenvolvimento quando necessários.
6. Configure SMTP para convites e recuperação de senha. Ajuste o convite para abrir `/definir-senha` após a verificação. Os links de recuperação também usam essa rota.
7. Reinicie o Vite após alterar as variáveis. Em produção, gere outro build, porque as variáveis públicas são incorporadas no build.

O cliente mantém a sessão e renova o token com o SDK. A autorização é consultada novamente ao focar a janela e a cada 60 segundos; **todas** as leituras/mutações do banco verificam o direito atual independentemente desse intervalo. Revogação e vencimento bloqueiam as operações mesmo quando um JWT continua válido. Falha ao verificar acesso mostra recuperação, sem liberar os dados.

## Conceder acesso a um comprador

Procedimento manual seguro enquanto o checkout não foi escolhido:

1. Confirme a compra administrativamente.
2. Convide/crie a conta em **Supabase Dashboard → Authentication → Users**. Configure o redirecionamento do convite para `/definir-senha`.
3. Copie o UUID do usuário. No **SQL Editor administrativo**, substitua os valores abaixo:

```sql
select public.admin_grant_access(
  'UUID_DO_COMPRADOR'::uuid,
  null -- ou uma validade absoluta, por exemplo '2027-01-01T03:00:00Z'
);

select public.admin_assign_protocol(
  'UUID_DO_COMPRADOR'::uuid,
  'UUID_DO_PROTOCOLO'::uuid,
  'UUID_DA_FASE'::uuid
);
```

Essas funções são executáveis apenas pelo administrador do banco e pela `service_role`. Usuários autenticados não possuem permissão de escrita em direitos de acesso, atribuições, modelos ou eventos de pagamento.

Opcionalmente, execute `node scripts/grant-access.mjs` em um terminal administrativo confiável. Ele lê `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BUYER_ID`, `ACCESS_UNTIL` (opcional) e o par opcional `PROTOCOL_ID`/`PHASE_ID` do ambiente. Não imprime chaves, não cria um endpoint e não envia convites. Não execute esse script no frontend.

Reembolso/revogação manual auditável:

```sql
select public.apply_billing_event(
  'administrative', gen_random_uuid()::text,
  'UUID_DO_COMPRADOR'::uuid, 'testomax', 'revoked', clock_timestamp(), null
);
```

## Conteúdo e personalização

As migrations não inserem compras nem conteúdo profissional. Para experimentar o fluxo remoto, execute **opcionalmente** `supabase/seed.sql` no SQL Editor. Ele cria um programa **de demonstração**, cinco refeições variantes e atividades ilustrativas, sem usuários nem direitos de acesso.

IDs desse programa de exemplo:

- Protocolo: `10000000-0000-4000-8000-000000000001`.
- Fase inicial: `20000000-0000-4000-8000-000000000001`.

Atribua-os com `admin_assign_protocol`. O seed automático da CLI está desativado. Para produção comercial, cadastre e revise o conteúdo profissional, publique o protocolo e atribua-o aos compradores. O indicador `is_demo` permanece visível nos exemplos. Fotografias são ilustrativas, não uma representação exata das porções.

As preferências selecionam modelos cadastrados por objetivo, experiência e alimentação, além de horários e dias de atividade. O onboarding tem três etapas; valores opcionais de preferência já têm padrões editáveis. Nenhuma prescrição é gerada por IA. Na base de exemplos, iniciantes recebem um conteúdo introdutório sem séries prescritas; bem-estar prioriza uma pausa; o plano vegetariano utiliza uma alternativa cadastrada.

Modelos e atribuições são separados. A rotina inicial só é gerada após concluir o onboarding. São materializados hoje e os próximos sete dias. O conteúdo de cada atribuição é um **snapshot**; ajustar preferências reorganiza apenas os dias futuros sem conclusões. Os registros anteriores e o dia atual são preservados, inclusive na troca de fuso. A aplicação não inventa atribuições retroativas para períodos anteriores ao primeiro acesso ou lacunas além da janela materializada.

## O que está funcional

- Login, recuperação/definição de senha, sessão persistente, logout e telas de acesso pendente, expirado e revogado.
- Onboarding, preferências editáveis e rotina inicial.
- Hoje: próxima ação, conclusão/desfazer, detalhes, próxima refeição, compras e resumo semanal. Dia concluído mostra uma prévia de amanhã.
- Protocolos: hoje, semana, hábitos, horários editáveis, fases e exercícios quando cadastrados.
- Alimentação: refeições por dia, ingredientes, preparo, substituições e registro de consumo. Valores nutricionais aparecem apenas quando o plano contém dados.
- Compras: geração por período, conversão kg→g e L→ml, soma de unidades compatíveis, marcações persistentes e itens pessoais editáveis. Unidades não são somadas com massas ou volumes. Uma nova geração substitui os itens gerados e preserva itens pessoais e marcações compatíveis.
- Progresso: conclusão diária, calendário, sequência atual/melhor, semana e comparação de dois períodos encerrados.
- Perfil: preferências, acesso, instalação, senha, ajuda, privacidade e saída.

Atualizações são otimistas e reversíveis na interface. Em falha, a alteração visual é revertida e uma mensagem persistente permite repetir a mesma operação. Conclusões usam uma chave única por atividade/usuário: repetir o pedido não cria duplicatas. Intenções ainda não confirmadas ficam apenas na memória da aba durante quedas de conexão e podem ser reenviadas ao reconectar. Não há uma fila privada persistente offline: se a aba for fechada antes da confirmação, confira os registros ao voltar.

Na conta real, os dados ficam no banco e podem ser carregados em outro dispositivo. Na demonstração, o armazenamento é local. O MVP carrega o histórico do titular integralmente para calcular a melhor sequência; para grandes históricos, planeje paginação e agregações no backend.

## Indicadores

- **Dia:** conclusões / atividades atribuídas ao dia × 100, arredondado. Sem atribuições = 0%, sem inferir uma conquista.
- **Semana:** conclusões de segunda-feira até hoje / atividades atribuídas nesse intervalo. Dias futuros são excluídos.
- **Sequência:** dias consecutivos em que todas as atividades atribuídas foram concluídas. Um dia sem atribuições não conta. Se hoje estiver incompleto, a contagem começa em ontem, sem encerrar a sequência prematuramente.
- **Melhor sequência:** maior intervalo consecutivo completo em todo o histórico carregado.
- **Comparação:** últimos sete dias encerrados (ontem até seis dias antes) versus os sete anteriores. Diferença em pontos percentuais, exibida quando existe histórico abrangendo 14 dias.
- **Refeições:** registros independentes, fora dos percentuais de atividades. Macros consumidos somam apenas refeições registradas; planejados somam refeições com dados nutricionais. Dados ausentes não são estimados.

Datas são civis (`YYYY-MM-DD`) no fuso IANA do perfil. A API gera dias a partir do horário do banco; o cliente reavalia a mudança do dia a cada 30 segundos. Não é usado `toISOString()` para atribuir o dia local do usuário.

## PWA, offline e atualizações

```bash
npm run build
npm run preview
```

O service worker só é registrado em produção/preview. `scripts/build-sw.mjs` cria um cache versionado pelo hash dos arquivos. A lista de cache é explícita: HTML público, bundles, estilos, fontes, imagens, ícones e manifest. Requisições do Supabase, respostas de APIs, tokens em URL e dados pessoais não entram no cache.

- Navegação: rede primeiro; offline utiliza o HTML público pré-cacheado.
- Arquivos públicos sem query string: cache primeiro.
- APIs e outras origens: somente rede.
- Atualização: novo worker espera; aviso discreto permite ativação. A ação fica desabilitada durante mutações/falhas e bloqueada se há preferências não salvas.
- Offline: abre a estrutura e uma explicação útil; dados protegidos não são exibidos, nem o acesso é considerado verificado.
- Logout/troca de conta: queries, estados e intenções em memória são limpos. O cache público pode permanecer, pois não contém dados de conta.

Manifest com `id` estável, `standalone`, ícones 192/512, ícone maskable e ícone Apple. O perfil oferece instalação quando o navegador emite o evento e instruções manuais quando não emite. Detecta o modo instalado. Não solicita notificações: não existe infraestrutura de push neste MVP.

## Checkout e webhook

O endpoint `supabase/functions/payment-webhook` permanece **desabilitado (HTTP 503)** sem configuração. O contrato `PaymentAdapter` separa provedor e eventos normalizados: compra aprovada, renovação, reembolso e revogação.

O adaptador de referência `gateway` atende um **gateway privado seu**, e não representa uma integração pronta com qualquer checkout. Ele exige:

- `PAYMENT_PROVIDER=gateway` e `PAYMENT_WEBHOOK_SECRET` com pelo menos 32 caracteres, exclusivamente nos secrets da Edge Function.
- HMAC-SHA256 hexadecimal em `x-testomax-signature`, sobre `timestamp.corpoBruto`.
- Timestamp Unix de dez dígitos em `x-testomax-timestamp`, com tolerância de cinco minutos.
- Corpo até 64 KiB; `eventId`, `userId` UUID já vinculado à compra, `productId="testomax"`, `kind`, `occurredAt` ISO e `expiresAt` ISO ou `null`.

Assinatura é verificada antes de analisar e aplicar o evento. O frontend nunca recebe o segredo nem a service role. Não há liberação por simples e-mail. `(provider,event_id)` garante idempotência dentro da transação; eventos antigos não sobrescrevem o estado novo, e revogação prevalece em empate de timestamp.

Depois de escolher o checkout, implemente a validação oficial do provedor, o vínculo confiável compra→UUID, o mapeamento dos eventos e a estratégia de validade/renovação. Se o comprador puder ter várias assinaturas simultâneas do mesmo produto, amplie o modelo para direitos por assinatura antes de agregar o acesso: o MVP assume um direito por usuário/produto.

## Publicar

Hospedagem estática: build `npm run build`, diretório `dist`, HTTPS obrigatório. Configure as variáveis públicas **antes do build** e uma regra SPA que encaminhe rotas desconhecidas para `index.html`. Preserve arquivos existentes; `/sw.js` e o HTML devem revalidar, enquanto assets com hash podem usar cache imutável.

O manifesto de Sites em `.openai/hosting.json` declara `dist`. Uma publicação privada sem credenciais mostra o estado de configuração; a demonstração continua exclusiva do desenvolvimento. As chaves administrativas e os secrets da Edge Function devem ser configurados somente no Supabase, nunca na hospedagem do frontend.

## Verificar

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

No Windows, é possível reutilizar Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

Com `npm run preview -- --port 4173` em outro terminal:

```bash
node scripts/verify-production.mjs
```

Os testes SQL executam as migrations reais no PostgreSQL embutido PGlite. Somente o esquema de usuários e a função `auth.uid()` são simulados. Testam RLS, tentativas de escalada, usuários sem acesso, validade, isolamento, conclusões idempotentes, persistência, histórico, preferências e eventos. Os testes de assinatura verificam HMAC, corpo adulterado e replay expirado.

Playwright verifica os fluxos da demonstração em notebook e celular emulados, teclado, dialogs, ausência de transbordamento em 320/390/844/1280/1440 px e auditoria automática de contraste/rótulos com axe. O teste de produção verifica ausência de bypass de demonstração, manifest, registro do SW, conteúdo do cache e abertura offline de uma rota protegida.

**Limites da validação:** não foram usados aparelhos físicos, contas Supabase reais, SMTP real, duas sessões reais em dispositivos distintos ou um checkout real. O teste de isolamento é no PostgreSQL local, e os testes de interface usam a demonstração. Valide esses serviços antes de liberar para compradores.

## Integrações e conteúdo pendentes

1. Projeto Supabase, variáveis públicas e aplicação das migrations no ambiente definitivo.
2. SMTP, convites e URLs de redirecionamento reais.
3. Checkout escolhido, assinatura oficial, vínculo com os compradores e testes de eventos reais.
4. Conteúdo de treino/alimentação aprovado, protocolos/fases e atribuição aos compradores.
5. Identidade e contato reais de suporte e do responsável pelo tratamento de dados.
6. Testes finais no domínio HTTPS e dispositivos físicos de destino.

## Referências e imagens

Configuração consultada na documentação oficial de [Vite](https://vite.dev/guide/), [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite), [shadcn/ui](https://ui.shadcn.com/docs/installation/vite), [React Router](https://reactrouter.com/start/declarative/installation), [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates), [Supabase Auth](https://supabase.com/docs/guides/auth/passwords) e [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Fotos ilustrativas de [Monika Grabkowska — café da manhã](https://unsplash.com/photos/a-bowl-of-yogurt-with-fruit-on-top-g3F-FOlf51M) e [joe boshra — almoço](https://unsplash.com/photos/a-wooden-bowl-filled-with-chicken-rice-and-beans-GVJAkiE71Kg), além de paisagem, frutas e vegetais do Unsplash. As URLs dos arquivos estão em `scripts/prepare-assets.mjs`; as imagens são locais no aplicativo. As capturas fornecidas pelo usuário foram usadas somente como referência visual.
