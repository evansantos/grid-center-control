# Grid Dashboard — Backlog Extenso de Melhorias

> Criado: 2026-02-17 | Diretiva: Evan  
> Status: Ready for SPEC → Grid CLI pipeline  
> Prioridades: P0 (crítico/próximo), P1 (alto valor), P2 (bom ter), P3 (visão futura)

---

## 0. 🐛 BUG EXISTENTE — PRIORIDADE MÁXIMA

### BUG-01: Living Office Status Intermitente (P0 — FIX FIRST)
O mapa do Living Office às vezes não atualiza o status dos agentes — ficam todos mostrando "idle" mesmo com agentes trabalhando. Bug intermitente. Provável causa: polling da API `/api/activity` com race conditions, dados stale, ou timing issues. **Investigar root cause primeiro.** Se for limitação do polling, migrar pra SSE (Server-Sent Events) como parte do AUT-01. Assign: GRID ⚡

---

## 0.5 🔧 BUG REVIEW FIXES — Wave 2 (P1)

### FIX-01: Cache `/api/subagents` Route (P1)
Única rota API sem cache. Lê JSONL inteiros a cada request. Adicionar cache in-memory (30-60s) como as outras rotas.

### FIX-02: Error Feedback em subagent-tree e spawn-form (P1)
Catch blocks vazios — erros somem sem feedback pro user. Adicionar toast/alert quando fetch falha.

### FIX-03: Otimizar `/api/analytics/performance` (P1)
Lê cada linha de cada JSONL. Considerar ler só first+last line para timestamps, ou background aggregation.

### FIX-04: Batch 1 Polish (P1)
- Remover `isAgentActive` dead code em `api/agents/status/route.ts`
- Fix `require('fs')` → usar `readdirSync` já importado
- Extrair `AGENT_DISPLAY` para `lib/agent-meta.ts` (duplicado em 3 componentes)
- Tighten error detection regexes (muito broad, pega texto normal)
- Escape key no ErrorModal
- Health circle: pulse só em yellow/red, não green

---

## 1. 🔭 Observabilidade — Real-Time Visibility

### OBS-01: Live Agent Activity Stream (P0)
Feed em real-time mostrando o que cada agente está fazendo AGORA — tool calls, file edits, web searches, messages enviadas. WebSocket-based, não polling. Cada evento com timestamp, tipo, e preview do conteúdo.

### OBS-02: Agent State Machine Visualization (P0)
Status detalhado de cada agente: idle, thinking, executing tool, waiting for response, error. Indicador visual claro (pulsing dot, cor, ícone) tanto na office view quanto na list view. Tempo no estado atual.

### OBS-03: Session Timeline com Flame Graph (P1)
Timeline visual de uma sessão mostrando cada step: user message → thinking → tool call → response. Tipo flame graph horizontal. Permite ver onde o tempo foi gasto (thinking vs tool execution vs waiting).

### OBS-04: Error & Alert Dashboard (P1)
Painel dedicado a erros, timeouts, retries, rate limits. Filtros por agente, tipo de erro, timeframe. Alertas visuais (badge no nav, toast) quando algo dá errado. Histórico de incidentes.

### OBS-05: Token Usage Live Counter (P1)
Contador em tempo real de tokens sendo consumidos. Por agente, por sessão, acumulado do dia. Gauge visual mostrando burn rate atual vs média.

### OBS-06: Tool Call Heatmap (P2)
Mapa de calor mostrando quais tools são mais usadas, por agente, por hora do dia. Identifica padrões — "SPEC usa muito exec às 3am", "CEO faz web_search em rajadas".

### OBS-07: Dependency Graph Between Agents (P2)
Visualização de quem spawna quem, quem delega pra quem. Graph interativo mostrando as relações entre agentes em tempo real. Útil pra entender cascatas de sub-agents.

### OBS-08: Log Aggregator com Full-Text Search (P1)
Busca unificada em todos os logs de todos os agentes. Filtros por data, agente, tipo de mensagem, tool. Syntax highlighting. Export.

---

## 2. 🎮 Controle — Interagir com Agentes

### CTL-01: Send Message to Agent (P0)
Caixa de texto no dashboard pra mandar mensagem direta pra qualquer agente. Equivalente a falar com ele no Telegram, mas pelo dashboard. Com histórico da conversa inline.

### CTL-02: Pause / Resume / Kill Agent (P0)
Botões de controle por agente: pausar processamento, resumir, matar sessão. Com confirmação pra ações destrutivas. Status reflete imediatamente na UI.

### CTL-03: Steer Sub-Agent from Dashboard (P1)
Interface visual pra usar o `subagents steer` — ver sub-agents ativos, mandar steering messages, ver progresso. Arvore de sub-agents com expand/collapse.

### CTL-04: Quick Actions / Runbook Buttons (P1)
Botões configuráveis por agente: "Run daily report", "Check emails", "Deploy staging". Cada botão é um comando pré-definido. Configurável via YAML/JSON.

### CTL-05: Agent Configuration Editor (P2)
Editar SOUL.md, TOOLS.md, HEARTBEAT.md de cada agente direto no dashboard. Monaco editor com syntax highlighting, preview, save com git commit automático.

### CTL-06: Spawn New Agent Session (P1)
Formulário pra criar nova sessão: escolher agente, modelo, task description, timeout. Equivalente ao `sessions_spawn` mas visual. Template library pra tasks comuns.

### CTL-07: Cron Job Manager (P2)
UI pra ver, criar, editar, deletar cron jobs de cada agente. Próxima execução, histórico de runs, logs de cada execução. Toggle enable/disable.

### CTL-08: Bulk Operations (P3)
Selecionar múltiplos agentes e aplicar ação: restart all, send broadcast message, update config. Útil pra manutenção.

---

## 3. 📊 Analytics — Performance, Custos, Tendências

### ANA-01: Cost Dashboard (P0)
Custo total por dia/semana/mês. Breakdown por agente, por modelo, por tipo de operação. Gráfico de tendência. Budget alerts configuráveis. Projeção de custo mensal baseado no ritmo atual.

### ANA-02: Agent Performance Scorecards (P1)
Métricas por agente: tasks completed, avg response time, error rate, tokens per task, cost per task. Comparação entre agentes. Trend sparklines.

### ANA-03: Session Analytics (P1)
Duração média de sessões, distribuição de steps por sessão, taxa de sucesso, sessions por hora do dia. Heatmap de atividade (calendar view tipo GitHub contributions).

### ANA-04: Model Comparison Dashboard (P2)
Quando múltiplos modelos são usados: comparar latência, custo, quality (se houver feedback). Ajuda a decidir qual modelo pra qual agente.

### ANA-05: Trend Alerts & Anomaly Detection (P2)
Detectar automaticamente: custo subiu 50% vs semana passada, agente X com error rate incomum, usage spike fora do padrão. Notificação visual + optional push.

### ANA-06: Weekly/Monthly Report Generator (P2)
Gerar relatório automático: o que foi feito, custos, highlights, problemas. Export PDF/markdown. Pode ser scheduled via cron.

### ANA-07: ROI Tracker (P3)
Estimar valor gerado vs custo. Input manual de "quanto tempo humano isso economizou". Dashboard mostrando payback.

---

## 4. ✨ UX / Polish — Prazer de Usar

### UX-01: Keyboard-First Navigation (P0)
Além do ⌘K existente: vim-like shortcuts (j/k pra navegar lista de agentes, Enter pra abrir, Esc pra voltar). Cheat sheet acessível via `?`. Zero mouse needed.

### UX-02: Light Theme + Theme Switcher (P1)
Tema claro pra quem prefere, com toggle no navbar. Respeitar system preference. Smooth transition animation.

### UX-03: Customizable Dashboard Layout (P1)
Drag-and-drop widgets na home. Cada pessoa monta seu dashboard: quais cards, qual ordem, qual tamanho. Persist no localStorage. Presets: "ops view", "cost view", "dev view".

### UX-04: Global Search (⌘K Enhancement) (P1)
Command palette buscar tudo: agentes, sessões, logs, configs, métricas. Fuzzy search. Recent items. Quick actions inline nos resultados.

### UX-05: Notification Center (P1)
Dropdown no navbar com histórico de notificações. Filtros, mark as read, click to navigate. Agrupa notificações similares. Badge counter.

### UX-06: Breadcrumb Navigation (P2)
Breadcrumbs claros: Home > Agents > SPEC > Session #42 > Step 7. Clickable. Ajuda orientação em deep navigation.

### UX-07: Responsive Mobile View (P2)
Layout que funciona em celular. Office view adaptado (scroll horizontal ou zoom). Cards empilhados. Touch-friendly controls.

### UX-08: Onboarding Tour (P3)
First-time user tour guiado: "this is the office", "click an agent to see details", "use ⌘K for quick access". Skippable, replayable.

### UX-09: Sound Effects & Audio Feedback (P3)
Sons sutis: notification ding, agent completed task, error alert. Toggleable. Volume control. Ambient office sounds opcional.

---

## 5. 🏢 Living Office — Escritório Virtual Vivo

### OFF-01: Agent Speech Bubbles (P0)
Quando um agente está processando, mostrar speech bubble com resumo do que tá fazendo: "Searching web...", "Writing code...", "Thinking...". Disappear após idle.

### OFF-02: Visual Status Indicators on Sprites (P0)
Sprites dos agentes mudam visualmente baseado no status: brilho/aura quando ativo, Zzz quando idle longo, ! quando erro, 💬 quando conversando. Sem precisar hover.

### OFF-03: Agent Interaction Animations (P1)
Quando agente A spawna sub-agent B, mostrar animação: A vai até B, "conversa", B começa a trabalhar. Quando termina, B vai até A entregar resultado. Visualiza o fluxo de trabalho.

### OFF-04: Office Zones / Departments (P1)
Organizar o escritório em zonas: "Engineering" (SPEC, DEV, QA), "Operations" (OPS, DEVOPS), "Management" (CEO, PM). Separadores visuais, labels. Drag to reorganize.

### OFF-05: Mini-Map (P2)
Se o office crescer, mini-map no canto mostrando visão geral. Click to navigate. Highlight de atividade.

### OFF-06: Day/Night Cycle (P2)
Office muda baseado na hora real: luz do dia, entardecer, noite. Agentes inativos "vão embora" à noite. Puramente cosmético mas delightful.

### OFF-07: Achievement Badges on Desks (P2)
Cada mesa mostra badges/trophies: "1000 tasks completed", "Zero errors today", "Most active this week". Gamification visual.

### OFF-08: Customizable Office Theme (P3)
Escolher estilo do office: escritório corporativo, café hipster, nave espacial, floresta. Skins diferentes pros sprites. Fun factor.

### OFF-09: Visitor Indicator (P3)
Quando o humano está ativo no dashboard, mostrar um avatar do usuário andando pelo office. Múltiplos usuários podem ver uns aos outros (futuro multi-user).

---

## 6. 🤖 Automação — Dashboard Inteligente

### AUT-01: Auto-Refresh & Smart Polling (P0)
Dashboard se atualiza automaticamente. WebSocket pra dados críticos (status, activity). Polling inteligente pra dados menos urgentes. Indicador "last updated" e manual refresh button.

### AUT-02: Scheduled Dashboard Snapshots (P2)
Gerar screenshot/report do dashboard automaticamente todo dia/semana. Salvar histórico. Útil pra ver evolução ao longo do tempo.

### AUT-03: Auto-Escalation Rules (P1)
Configurar regras: "se agente X fica em error por >5min, notificar no Telegram", "se custo diário passa de $Y, pausar agentes não-críticos". Rule builder visual.

### AUT-04: Smart Agent Recommendations (P2)
Dashboard sugere: "SPEC está idle e há 3 tasks no backlog — assign?", "DEV terminou — QA deveria revisar", "Custo alto hoje — considere trocar pra modelo mais barato".

### AUT-05: Automated Health Checks (P1)
Dashboard roda health checks periódicos: gateway online? agentes responsivos? disk space? API keys válidas? Status page com green/yellow/red.

### AUT-06: Workflow Templates (P3)
Definir workflows multi-agente visuais: "New Feature" = CEO define → SPEC desenha → DEV implementa → QA testa → DEVOPS deploya. One-click start, track progress.

---

## Resumo por Prioridade

| Prio | Count | Items |
|------|-------|-------|
| P0   | 8     | OBS-01, OBS-02, CTL-01, CTL-02, ANA-01, UX-01, OFF-01, OFF-02, AUT-01 |
| P1   | 14    | OBS-03, OBS-04, OBS-05, OBS-08, CTL-03, CTL-04, CTL-06, ANA-02, ANA-03, UX-02, UX-03, UX-04, UX-05, OFF-03, OFF-04, AUT-03, AUT-05 |
| P2   | 12    | OBS-06, OBS-07, CTL-05, CTL-07, ANA-04, ANA-05, ANA-06, UX-06, UX-07, OFF-05, OFF-06, OFF-07, AUT-02, AUT-04 |
| P3   | 7     | CTL-08, ANA-07, UX-08, UX-09, OFF-08, OFF-09, AUT-06 |

**Total: 41 items**

---

## Sequência Sugerida de Execução

### Wave 1 — Foundation (P0s)
1. AUT-01 (Auto-Refresh/WebSocket) — base pra tudo real-time
2. OBS-01 + OBS-02 (Live Activity + State Machine) — ver o que tá acontecendo
3. OFF-01 + OFF-02 (Speech Bubbles + Status on Sprites) — office ganha vida
4. CTL-01 + CTL-02 (Message + Pause/Kill) — controle básico
5. ANA-01 (Cost Dashboard) — visibilidade de custo
6. UX-01 (Keyboard Navigation) — power user flow

### Wave 2 — Power Features (P1s)
7. OBS-08 (Log Search) + OBS-05 (Token Counter)
8. CTL-03 + CTL-06 (Steer Sub-agents + Spawn)
9. ANA-02 + ANA-03 (Scorecards + Session Analytics)
10. UX-02 + UX-03 + UX-04 (Themes + Layout + Search)
11. OFF-03 + OFF-04 (Interactions + Zones)
12. AUT-03 + AUT-05 (Escalation + Health Checks)

### Wave 3+ — Polish & Vision (P2/P3)
Priorizar baseado em feedback das waves anteriores.
