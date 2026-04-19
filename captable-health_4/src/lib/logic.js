export const TYPE_LABELS = {
  founder: 'Fundador',
  'cofound-tech': 'Cofundador técnico',
  cto: 'CTO contratado',
  clevel: 'C-Level',
  manager: 'Gerente estratégico',
  advisor: 'Advisor',
  investor: 'Investidor',
  pool: 'Equity Pool',
}

export const TYPE_CATEGORY = {
  founder: 'founder',
  'cofound-tech': 'founder',
  cto: 'employee',
  clevel: 'employee',
  manager: 'employee',
  advisor: 'advisor',
  investor: 'investor',
  pool: 'pool',
}

export const STAGE_LABELS = {
  'pre-seed': 'Pre-Seed',
  seed: 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B',
}

export const BENCHMARKS = {
  'pre-seed': { foundersMin: 75, foundersMax: 90, poolMin: 10, poolMax: 15, investMin: 5, investMax: 15 },
  seed:       { foundersMin: 60, foundersMax: 80, poolMin: 8,  poolMax: 15, investMin: 10, investMax: 25 },
  'series-a': { foundersMin: 45, foundersMax: 65, poolMin: 8,  poolMax: 15, investMin: 25, investMax: 45 },
  'series-b': { foundersMin: 35, foundersMax: 55, poolMin: 8,  poolMax: 15, investMin: 40, investMax: 60 },
}

export const EQUITY_RANGES = {
  founder:        { min: 20, max: 90, warn: 10 },
  'cofound-tech': { min: 10, max: 30, warn: 5 },
  cto:            { min: 2,  max: 5,  warn: 1 },
  clevel:         { min: 1,  max: 3,  warn: 0.5 },
  manager:        { min: 0.2,max: 1,  warn: 0.1 },
  advisor:        { min: 0.1,max: 1,  warn: 0.5 },
  investor:       { min: 5,  max: 30, warn: 2 },
  pool:           { min: 8,  max: 15, warn: 5 },
}

export function calcTotals(shareholders) {
  const totals = { founder: 0, employee: 0, investor: 0, pool: 0, total: 0 }
  for (const s of shareholders) {
    const cat = TYPE_CATEGORY[s.type] || 'employee'
    const pct = parseFloat(s.pct) || 0
    totals[cat] = (totals[cat] || 0) + pct
    totals.total += pct
  }
  return totals
}

export function calcScore(shareholders, stage) {
  const bench = BENCHMARKS[stage]
  const t = calcTotals(shareholders)
  let score = 100
  const founders = t.founder

  if (founders < bench.foundersMin) score -= Math.min(35, (bench.foundersMin - founders) * 1.8)
  if (founders > bench.foundersMax) score -= 5
  if (t.pool < bench.poolMin) score -= 15
  if (t.pool > bench.poolMax) score -= 20

  const noVest = shareholders.filter(
    s => TYPE_CATEGORY[s.type] === 'founder' && !s.vesting
  )
  score -= noVest.length * 18

  const badAdvisors = shareholders.filter(
    s => s.type === 'advisor' && parseFloat(s.pct) > 1
  )
  score -= badAdvisors.length * 12

  const tinyMinority = shareholders.filter(
    s => !['investor', 'pool'].includes(s.type) && parseFloat(s.pct) > 0 && parseFloat(s.pct) < 1
  )
  if (tinyMinority.length > 3) score -= 10

  if (Math.abs(t.total - 100) > 1) score -= 20

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getAlerts(shareholders, stage) {
  const bench = BENCHMARKS[stage]
  const t = calcTotals(shareholders)
  const alerts = []

  if (Math.abs(t.total - 100) > 1) {
    alerts.push({
      level: 'danger',
      title: 'Cap table não fecha em 100%',
      desc: `Total atual: ${t.total.toFixed(1)}%. Revise as participações antes de apresentar a qualquer investidor.`,
    })
  }

  if (t.founder < bench.foundersMin) {
    alerts.push({
      level: 'danger',
      title: 'Fundadores muito diluídos para este estágio',
      desc: `${t.founder.toFixed(1)}% está abaixo do mínimo recomendado de ${bench.foundersMin}% para ${STAGE_LABELS[stage]}. Investidores podem interpretar como falta de controle e comprometimento.`,
    })
  }

  const noVestFounders = shareholders.filter(
    s => TYPE_CATEGORY[s.type] === 'founder' && !s.vesting
  )
  if (noVestFounders.length > 0) {
    alerts.push({
      level: 'danger',
      title: 'Fundador sem vesting — red flag crítico',
      desc: `${noVestFounders.map(s => s.name).join(', ')} não possui vesting. Fundos de venture capital normalmente exigem vesting para todos os fundadores antes de investir.`,
    })
  }

  if (t.pool > 15) {
    alerts.push({
      level: 'danger',
      title: 'Equity pool acima do limite de mercado',
      desc: `Pool em ${t.pool.toFixed(1)}%. VCs esperam no máximo 15%. Acima disso sinaliza distribuição inadequada ou governança frouxa.`,
    })
  }

  if (t.pool < bench.poolMin && t.pool > 0) {
    alerts.push({
      level: 'warn',
      title: 'Equity pool insuficiente',
      desc: `Pool em ${t.pool.toFixed(1)}%. Para ${STAGE_LABELS[stage]} recomenda-se pelo menos ${bench.poolMin}% para conseguir contratar executivos estratégicos.`,
    })
  }

  if (t.pool === 0) {
    alerts.push({
      level: 'warn',
      title: 'Nenhum equity pool reservado',
      desc: `Reservar entre ${bench.poolMin}% e ${bench.poolMax}% desde a fundação é essencial para atrair talentos sem recursos financeiros suficientes.`,
    })
  }

  const badAdvisors = shareholders.filter(s => s.type === 'advisor' && parseFloat(s.pct) > 1)
  if (badAdvisors.length > 0) {
    alerts.push({
      level: 'warn',
      title: 'Advisor com participação excessiva',
      desc: `${badAdvisors.map(s => `${s.name} (${parseFloat(s.pct).toFixed(1)}%)`).join(', ')}. Advisors raramente justificam mais de 0,5%–1%. Isso pode ser questionado por investidores.`,
    })
  }

  const tinyMinority = shareholders.filter(
    s => !['investor', 'pool'].includes(s.type) && parseFloat(s.pct) > 0 && parseFloat(s.pct) < 1
  )
  if (tinyMinority.length > 3) {
    alerts.push({
      level: 'warn',
      title: 'Cap table fragmentado',
      desc: `${tinyMinority.length} sócios com menos de 1% cada. Excesso de minoritários gera complexidade jurídica e pode travar processos decisórios em rodadas futuras.`,
    })
  }

  if (t.founder > bench.foundersMax && t.total > 50) {
    alerts.push({
      level: 'info',
      title: 'Founders acima da faixa típica',
      desc: `${t.founder.toFixed(1)}% está acima da faixa de referência (${bench.foundersMax}%) para ${STAGE_LABELS[stage]}. Isso é positivo mas pode indicar que ainda não houve nenhuma rodada.`,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      level: 'ok',
      title: 'Cap table saudável',
      desc: `Nenhum problema identificado para o estágio ${STAGE_LABELS[stage]}. Continue monitorando a cada nova rodada ou adição de sócio.`,
    })
  }

  return alerts
}

export function simulateRound(shareholders, stage, pctSell, valuationM) {
  const t = calcTotals(shareholders)
  const preMoney = valuationM
  const raised = (valuationM * pctSell) / (100 - pctSell)
  const postMoney = preMoney + raised
  const foundersAfter = t.founder * (1 - pctSell / 100)
  const poolAfter = t.pool * (1 - pctSell / 100)
  const bench = BENCHMARKS[stage]
  const foundersOk = foundersAfter >= bench.foundersMin

  return { preMoney, raised, postMoney, foundersAfter, poolAfter, foundersOk }
}

export function generateVestingSchedule(pct, years, cliffYears, startDate) {
  const schedule = []
  const start = new Date(startDate)
  const totalMonths = years * 12
  const cliffMonths = cliffYears * 12
  let vested = 0

  for (let m = 1; m <= totalMonths; m++) {
    const date = new Date(start)
    date.setMonth(date.getMonth() + m)
    const newVested = m < cliffMonths ? 0 : (pct / totalMonths) * m
    const vestedClamped = Math.min(pct, newVested)
    const delta = Math.max(0, vestedClamped - vested)
    vested = vestedClamped

    if (m === cliffMonths || m === totalMonths || m % 12 === 0) {
      schedule.push({
        month: m,
        date: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        vestedPct: parseFloat(vestedClamped.toFixed(2)),
        deltaPct: parseFloat(delta.toFixed(2)),
        label: m === cliffMonths ? 'Cliff' : m % 12 === 0 ? `Ano ${m / 12}` : '',
        isCliff: m === cliffMonths,
        isFull: m === totalMonths,
      })
    }
  }
  return schedule
}

export const DEFAULT_STARTUP = {
  name: 'Minha Startup',
  stage: 'pre-seed',
  shareholders: [
    { id: 1, name: 'Ana Lima',    type: 'founder',       pct: 44, vesting: true,  vestYears: 4, cliffYears: 1, startDate: '2024-01-01' },
    { id: 2, name: 'Bruno Costa', type: 'founder',       pct: 43, vesting: true,  vestYears: 4, cliffYears: 1, startDate: '2024-01-01' },
    { id: 3, name: 'Equity Pool', type: 'pool',          pct: 13, vesting: false, vestYears: 4, cliffYears: 1, startDate: '2024-01-01' },
  ],
}
