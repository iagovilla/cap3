import React, { useState } from 'react'
import { generateVestingSchedule, TYPE_LABELS, TYPE_CATEGORY } from '../lib/logic.js'

const TYPE_COLORS = {
  founder: '#185FA5', 'cofound-tech': '#185FA5',
  cto: '#534AB7', clevel: '#534AB7', manager: '#888780',
}

export default function VestingTimeline({ shareholders }) {
  const eligible = shareholders.filter(s => s.vesting && TYPE_CATEGORY[s.type] !== 'investor' && s.type !== 'pool')
  const [selected, setSelected] = useState(eligible[0]?.id || null)

  if (eligible.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)', fontSize: 13 }}>
        Nenhum sócio com vesting configurado.<br />
        <span style={{ fontSize: 12 }}>Adicione um sócio com vesting para ver a linha do tempo.</span>
      </div>
    )
  }

  const person = shareholders.find(s => s.id === selected) || eligible[0]
  const schedule = generateVestingSchedule(
    parseFloat(person.pct),
    person.vestYears || 4,
    person.cliffYears || 1,
    person.startDate || new Date().toISOString().slice(0, 10)
  )

  const maxVested = parseFloat(person.pct)
  const color = TYPE_COLORS[person.type] || '#888780'

  return (
    <div>
      {eligible.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {eligible.map(s => (
            <button key={s.id} onClick={() => setSelected(s.id)}
              style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100,
                border: selected === s.id ? 'none' : '0.5px solid var(--border)',
                background: selected === s.id ? color : 'transparent',
                color: selected === s.id ? '#fff' : 'var(--text-2)',
                fontWeight: selected === s.id ? 500 : 400 }}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 500 }}>{person.name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{TYPE_LABELS[person.type]}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
        {parseFloat(person.pct).toFixed(1)}% total · {person.vestYears || 4} anos · cliff {person.cliffYears || 1} ano
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', height: 80 }}>
          {schedule.map((point, i) => {
            const barH = maxVested > 0 ? (point.vestedPct / maxVested) * 72 : 0
            const isCliff = point.isCliff
            return (
              <div key={i} title={`${point.date}: ${point.vestedPct.toFixed(1)}% adquirido`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 9, color: isCliff ? color : 'var(--text-3)', fontWeight: isCliff ? 600 : 400, marginBottom: 2 }}>
                  {isCliff ? 'Cliff' : ''}
                </div>
                <div style={{ width: '70%', height: barH, background: isCliff ? color : `${color}99`, borderRadius: '3px 3px 0 0', minHeight: barH > 0 ? 2 : 0, transition: 'height .3s' }} />
                <div style={{ width: '100%', height: 1, background: 'var(--border)' }} />
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
              {['Período', 'Data', 'Adquirido neste evento', 'Total acumulado', 'Progresso'].map(h => (
                <th key={h} style={{ padding: '5px 8px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((point, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--border)', background: point.isCliff ? 'var(--blue-l)' : point.isFull ? 'var(--green-l)' : 'transparent' }}>
                <td style={{ padding: '6px 8px', fontWeight: point.isCliff || point.isFull ? 500 : 400, color: point.isCliff ? 'var(--blue-t)' : point.isFull ? 'var(--green-t)' : 'var(--text)' }}>
                  {point.label || `Mês ${point.month}`}
                </td>
                <td style={{ padding: '6px 8px', color: 'var(--text-2)' }}>{point.date}</td>
                <td style={{ padding: '6px 8px', color: point.deltaPct > 0 ? color : 'var(--text-3)' }}>
                  {point.deltaPct > 0 ? `+${point.deltaPct.toFixed(2)}%` : '—'}
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 500 }}>{point.vestedPct.toFixed(2)}%</td>
                <td style={{ padding: '6px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${maxVested > 0 ? (point.vestedPct / maxVested) * 100 : 0}%`, height: '100%', background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', width: 30 }}>
                      {maxVested > 0 ? Math.round((point.vestedPct / maxVested) * 100) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
