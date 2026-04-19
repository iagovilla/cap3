import React, { useState } from 'react'
import { TYPE_LABELS, TYPE_CATEGORY, EQUITY_RANGES } from '../lib/logic.js'

const TYPES = Object.entries(TYPE_LABELS)

const TYPE_COLORS = {
  founder: '#185FA5', 'cofound-tech': '#185FA5',
  pool: '#0F6E56', investor: '#854F0B',
  cto: '#534AB7', clevel: '#534AB7', manager: '#888780', advisor: '#888780',
}

function Bar({ pct, total, type }) {
  const ratio = total > 0 ? Math.min(1, pct / total) : 0
  return (
    <div style={{ width: 72, height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${ratio * 100}%`, height: '100%', background: TYPE_COLORS[type] || '#888', borderRadius: 3, transition: 'width .3s' }} />
    </div>
  )
}

function AddRow({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', type: 'founder', pct: '', vesting: true, vestYears: 4, cliffYears: 1, startDate: new Date().toISOString().slice(0, 10) })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <tr style={{ background: 'var(--blue-l)' }}>
      <td style={{ padding: '8px 10px' }}>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Nome completo" autoFocus
          style={{ width: '100%', fontSize: 13, padding: '5px 8px', border: '0.5px solid var(--border-md)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)' }} />
      </td>
      <td style={{ padding: '8px 6px' }}>
        <select value={form.type} onChange={e => set('type', e.target.value)}
          style={{ fontSize: 12, padding: '5px 7px', border: '0.5px solid var(--border-md)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', width: '100%' }}>
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </td>
      <td style={{ padding: '8px 6px' }}>
        <input type="number" value={form.pct} onChange={e => set('pct', e.target.value)}
          placeholder="%" min={0} max={100} step={0.1}
          style={{ width: 64, fontSize: 13, padding: '5px 8px', border: '0.5px solid var(--border-md)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', textAlign: 'right' }} />
      </td>
      <td style={{ padding: '8px 6px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.vesting} onChange={e => set('vesting', e.target.checked)} />
          {form.vesting ? `${form.vestYears}a / cliff ${form.cliffYears}a` : 'Não'}
        </label>
      </td>
      <td colSpan={2} style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { if (form.name && form.pct) onAdd(form) }}
            style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, border: 'none', background: 'var(--blue)', color: '#fff' }}>
            Adicionar
          </button>
          <button onClick={onCancel}
            style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, border: '0.5px solid var(--border-md)', background: 'transparent', color: 'var(--text-2)' }}>
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function CapTable({ shareholders, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false)
  const total = shareholders.reduce((s, x) => s + (parseFloat(x.pct) || 0), 0)

  const handleAdd = (form) => {
    onUpdate('add', { ...form, id: Date.now(), pct: parseFloat(form.pct) })
    setAdding(false)
  }

  const totalColor = Math.abs(total - 100) < 0.5 ? 'var(--green)' : 'var(--red)'

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
              {['Nome', 'Tipo', '%', 'Vesting', 'Distribuição', ''].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shareholders.map(s => (
              <tr key={s.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'var(--bg-3)', color: 'var(--text-2)' }}>
                    {TYPE_LABELS[s.type] || s.type}
                  </span>
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <input
                    type="number" min={0} max={100} step={0.1}
                    value={parseFloat(s.pct).toFixed(1)}
                    onChange={e => onUpdate('pct', { id: s.id, pct: parseFloat(e.target.value) || 0 })}
                    style={{ width: 64, fontSize: 13, padding: '4px 7px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg-2)', color: 'var(--text)', textAlign: 'right' }}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  {TYPE_CATEGORY[s.type] !== 'investor' ? (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100,
                      background: s.vesting ? 'var(--green-l)' : 'var(--red-l)',
                      color: s.vesting ? 'var(--green-t)' : 'var(--red-t)' }}>
                      {s.vesting ? `${s.vestYears}a / cliff ${s.cliffYears}a` : 'Sem vesting'}
                    </span>
                  ) : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <Bar pct={parseFloat(s.pct) || 0} total={total} type={s.type} />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <button onClick={() => onDelete(s.id)}
                    style={{ width: 24, height: 24, borderRadius: '50%', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-3)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {adding && <AddRow onAdd={handleAdd} onCancel={() => setAdding(false)} />}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '0.5px solid var(--border-md)' }}>
              <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 500, fontSize: 13 }}>Total</td>
              <td style={{ padding: '8px 10px', fontWeight: 600, fontSize: 14, color: totalColor }}>{total.toFixed(1)}%</td>
              <td colSpan={3} style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-3)' }}>
                {Math.abs(total - 100) < 0.5 ? '✓ Fechado corretamente' : `Diferença: ${(total - 100).toFixed(1)}%`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!adding && (
        <button onClick={() => setAdding(true)}
          style={{ marginTop: 10, width: '100%', padding: '8px', fontSize: 12, borderRadius: 8, border: '0.5px dashed var(--border-md)', background: 'transparent', color: 'var(--text-3)' }}>
          + Adicionar sócio
        </button>
      )}
    </div>
  )
}
