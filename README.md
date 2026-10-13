# TestoMAX

PWA em português para organizar atividades, alimentação, sono e hábitos. Nesta versão inicial, a página de entrada possui um único botão e cada navegador mantém seus próprios registros localmente.

## Executar

Use Node.js 22.12+ ou 24 LTS:

```bash
npm ci
npm run dev
```

Abra a URL exibida pelo Vite e clique em **Entrar na minha rotina**.

No primeiro acesso, cada comprador ajusta objetivos, disponibilidade e estilo de alimentação. O acesso permanece conectado no dispositivo até a pessoa tocar em **Sair**. Preferências, atividades concluídas, refeições e lista de compras ficam no armazenamento local do navegador e não são apagadas ao sair.

O conteúdo local inclui quatro estilos de alimentação — variada, vegetariana, vegana e mediterrânea — com seis refeições diárias em cada opção. A rotina reúne protocolos de planejamento, movimento, hidratação, organização alimentar, leitura e descanso, distribuídos em cinco fases do programa.

## Dados locais

- Não há autenticação, credenciais, cadastro individual ou validação de compra.
- O aplicativo em execução não se conecta ao Supabase.
- Cada navegador possui uma rotina independente; os dados não sincronizam entre celular e computador.
- Limpar os dados do navegador remove a rotina registrada.
- O funcionamento offline mantém os arquivos públicos e os registros locais no dispositivo.

## Stack

- React 19, TypeScript e Vite 8.
- Tailwind CSS 4 e componentes Radix adaptados.
- React Router e TanStack Query.
- React Hook Form e Zod.
- PWA com manifest e service worker próprio.

## Verificar e publicar

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Para publicação estática, envie a pasta `dist`, use HTTPS e configure uma regra SPA que encaminhe rotas desconhecidas para `index.html`.

O manifesto de hospedagem em `.openai/hosting.json` usa `dist` como diretório de saída.

## Limitações desta fase

O botão libera o aplicativo diretamente e não restringe o acesso. Os dados existem somente no navegador utilizado. Quando for necessário controlar pagamentos, revogar acessos individualmente ou sincronizar registros entre dispositivos, será preciso adicionar autenticação e armazenamento em um backend.
