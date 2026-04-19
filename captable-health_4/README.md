# Cap Table Health — KVR Consulting

Sistema para startups manterem o cap table saudável, com alertas automáticos, simulador de rodadas e linha do tempo de vesting.

## Funcionalidades

- **Cap Table interativo** — adicione sócios, edite participações, configure vesting
- **Diagnóstico em tempo real** — score de saúde 0–100 com alertas detalhados
- **Simulador de rodada** — simule diluição antes de fechar negócio
- **Linha do tempo de vesting** — visualize a curva de aquisição de cada sócio
- **Exportação PDF** — relatório profissional com diagnóstico completo
- **Dados persistentes** — tudo salvo automaticamente no navegador (localStorage)

## Deploy na Vercel (3 passos)

### Pré-requisito
Ter conta na [Vercel](https://vercel.com) (grátis) e no [GitHub](https://github.com) (grátis).

### Passo 1 — Suba o código no GitHub
1. Crie um repositório novo no GitHub (ex: `captable-health`)
2. Faça upload de todos os arquivos desta pasta para o repositório

### Passo 2 — Conecte na Vercel
1. Acesse [vercel.com](https://vercel.com) e clique em "Add New Project"
2. Importe o repositório do GitHub
3. A Vercel detecta automaticamente que é um projeto Vite

### Passo 3 — Deploy
1. Clique em "Deploy" — pronto!
2. Em ~1 minuto seu app estará no ar com URL pública

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Estrutura do projeto

```
src/
  lib/
    logic.js      # Regras de negócio, benchmarks, alertas, vesting
    pdf.js        # Geração de PDF
  components/
    CapTable.jsx       # Tabela de sócios com edição inline
    Alerts.jsx         # Painel de diagnóstico
    RoundSimulator.jsx # Simulador de rodadas
    VestingTimeline.jsx # Linha do tempo de vesting
  App.jsx         # Aplicação principal
  main.jsx        # Entry point
  index.css       # Estilos globais
```

## Próximas versões sugeridas

- [ ] Múltiplas startups (multi-tenant)
- [ ] Login com Google (Firebase Auth)
- [ ] Banco de dados em nuvem (Supabase)
- [ ] Histórico de alterações do cap table
- [ ] Comparativo entre cenários de rodada
- [ ] Notificações por email de alertas críticos
