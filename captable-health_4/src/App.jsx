import React, { useState, useEffect, useMemo } from 'react'
import CapTable from './components/CapTable.jsx'
import Alerts from './components/Alerts.jsx'
import RoundSimulator from './components/RoundSimulator.jsx'
import VestingTimeline from './components/VestingTimeline.jsx'
import { calcTotals, calcScore, getAlerts, STAGE_LABELS, DEFAULT_STARTUP } from './lib/logic.js'
import { exportPDF } from './lib/pdf.js'

const STAGES = Object.entries(STAGE_LABELS)
const TABS = ['Cap Table', 'Vesting', 'Simulador']

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }, [key, val])
  return [val, setVal]
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '12px 14px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color || 'var(--text)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Card({ children, style: s }) {
  return (
    <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', ...s }}>
      {children}
    </div>
  )
}

function CardTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{children}</div>
}

export default function App() {
  const [startup, setStartup] = useLocalStorage('captable-startup', DEFAULT_STARTUP)
  const [activeTab, setActiveTab] = useState(0)
  const [editingName, setEditingName] = useState(false)

  const totals = useMemo(() => calcTotals(startup.shareholders), [startup.shareholders])
  const score = useMemo(() => calcScore(startup.shareholders, startup.stage), [startup.shareholders, startup.stage])
  const alerts = useMemo(() => getAlerts(startup.shareholders, startup.stage), [startup.shareholders, startup.stage])

  const dangerCount = alerts.filter(a => a.level === 'danger').length
  const warnCount = alerts.filter(a => a.level === 'warn').length

  const updateShareholders = (action, payload) => {
    setStartup(s => {
      if (action === 'pct') return { ...s, shareholders: s.shareholders.map(x => x.id === payload.id ? { ...x, pct: payload.pct } : x) }
      if (action === 'add') return { ...s, shareholders: [...s.shareholders, payload] }
      return s
    })
  }

  const deleteShareholder = (id) => {
    setStartup(s => ({ ...s, shareholders: s.shareholders.filter(x => x.id !== id) }))
  }

  const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 16px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
              Cap Table <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Health</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-md)' }} />
            {editingName ? (
              <input autoFocus value={startup.name}
                onChange={e => setStartup(s => ({ ...s, name: e.target.value }))}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                style={{ fontSize: 14, fontWeight: 500, border: 'none', borderBottom: '1.5px solid var(--blue)', background: 'transparent', color: 'var(--text)', outline: 'none', width: 200 }} />
            ) : (
              <span onClick={() => setEditingName(true)} title="Clique para editar"
                style={{ fontSize: 14, fontWeight: 500, cursor: 'text', color: 'var(--text)' }}>
                {startup.name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {STAGES.map(([key, label]) => (
                <button key={key} onClick={() => setStartup(s => ({ ...s, stage: key }))}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 100,
                    border: startup.stage === key ? 'none' : '0.5px solid var(--border)',
                    background: startup.stage === key ? 'var(--text)' : 'transparent',
                    color: startup.stage === key ? 'var(--bg)' : 'var(--text-2)', fontWeight: startup.stage === key ? 500 : 400, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => exportPDF(startup)}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid var(--border-md)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 12h10M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Exportar PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
          <MetricCard label="Fundadores" value={`${totals.founder.toFixed(1)}%`}
            sub={`ref: ${startup.stage === 'pre-seed' ? '75–90' : startup.stage === 'seed' ? '60–80' : startup.stage === 'series-a' ? '45–65' : '35–55'}%`}
            color={totals.founder >= 45 ? 'var(--green)' : totals.founder >= 30 ? 'var(--amber)' : 'var(--red)'} />
          <MetricCard label="Equity pool" value={`${totals.pool.toFixed(1)}%`} sub="ref: 10–15%" color={totals.pool >= 8 && totals.pool <= 15 ? 'var(--green)' : 'var(--amber)'} />
          <MetricCard label="Investidores" value={`${totals.investor.toFixed(1)}%`} sub="participação total" />
          <MetricCard label="Score de saúde" value={`${score}/100`}
            sub={score >= 75 ? 'Saudável' : score >= 50 ? 'Atenção' : 'Crítico'}
            color={scoreColor} />
          {dangerCount > 0 && (
            <MetricCard label="Alertas críticos" value={dangerCount} sub={`+ ${warnCount} avisos`} color="var(--red)" />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
                {TABS.map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(i)}
                    style={{ fontSize: 13, padding: '8px 16px', border: 'none', borderBottom: activeTab === i ? '2px solid var(--blue)' : '2px solid transparent',
                      background: 'transparent', color: activeTab === i ? 'var(--blue)' : 'var(--text-2)', fontWeight: activeTab === i ? 500 : 400, cursor: 'pointer', marginBottom: -1 }}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 0 && (
                <CapTable shareholders={startup.shareholders} onUpdate={updateShareholders} onDelete={deleteShareholder} />
              )}
              {activeTab === 1 && (
                <VestingTimeline shareholders={startup.shareholders} />
              )}
              {activeTab === 2 && (
                <RoundSimulator shareholders={startup.shareholders} stage={startup.stage} />
              )}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <CardTitle>Diagnóstico</CardTitle>
              <Alerts alerts={alerts} score={score} />
            </Card>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
          KVR Consulting · Cap Table Health · Dados salvos localmente no seu navegador · Apenas para referência, não configura assessoria jurídica ou societária.
        </div>
      </div>
    </div>
  )
}
