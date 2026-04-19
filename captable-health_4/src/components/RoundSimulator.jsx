import React, { useState } from 'react'
import { simulateRound, BENCHMARKS, STAGE_LABELS } from '../lib/logic.js'

export default function RoundSimulator({ shareholders, stage }) {
  const [pctSell, setPctSell] = useState(15)
  const [valuation, setValuation] = useState(20)

  const result = simulateRound(shareholders, stage, pctSell, valuation)
  const bench = BENCHMARKS[stage]

  const fmt = (n) => n >= 1000 ? `R$ ${(n / 1000).toFixed(1)}B` : `R$ ${n.toFixed(1)}M`

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)' }}>% a vender nesta rodada</label>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{pctSell}%</span>
          </div>
          <input type="range" min={1} max={40} step={1} value={pctSell}
            onChange={e => setPctSell(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--blue)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            <span>1%</span><span>ref: {bench.investMin}–{bench.investMax}%</span><span>40%</span>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)' }}>Valuation pre-money</label>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt(valuation)}</span>
          </div>
          <input type="range" min={1} max={500} step={1} value={valuation}
            onChange={e => setValuation(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--blue)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            <span>R$ 1M</span><span>R$ 500M</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-2)', borderRadius: 10, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
        {[
          ['Pre-money', fmt(result.preMoney), false],
          ['Capital captado', fmt(result.raised), false],
          ['Post-money', fmt(result.postMoney), false],
          ['Fundadores após rodada', `${result.foundersAfter.toFixed(1)}%`, !result.foundersOk],
          ['Pool após rodada', `${result.poolAfter.toFixed(1)}%`, false],
        ].map(([label, value, warn], i, arr) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '9px 14px',
            borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
            fontWeight: i === arr.length - 1 || i === arr.length - 2 ? 500 : 400,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
            <span style={{ fontSize: 13, color: warn ? 'var(--red)' : i >= arr.length - 2 ? 'var(--text)' : 'var(--text)' }}>
              {value}
              {warn && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--red)' }}>⚠ abaixo do mínimo</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
