import React from 'react'

const LEVEL_STYLE = {
  danger: { bg: 'var(--red-l)',   text: 'var(--red-t)',   dot: '#E24B4A' },
  warn:   { bg: 'var(--amber-l)', text: 'var(--amber-t)', dot: '#EF9F27' },
  ok:     { bg: 'var(--green-l)', text: 'var(--green-t)', dot: '#639922' },
  info:   { bg: 'var(--blue-l)',  text: 'var(--blue-t)',  dot: '#378ADD' },
}

export default function Alerts({ alerts, score }) {
  const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
  const scoreLabel = score >= 75 ? 'Saudável' : score >= 50 ? 'Requer atenção' : 'Risco alto'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 10 }}>
        <div style={{ fontSize: 36, fontWeight: 600, color: scoreColor, lineHeight: 1 }}>{score}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: scoreColor }}>{scoreLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>pontuação de saúde do cap table</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map((a, i) => {
          const s = LEVEL_STYLE[a.level] || LEVEL_STYLE.info
          return (
            <div key={i} style={{ background: s.bg, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: 4 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: s.text }}>{a.title}</div>
                <div style={{ fontSize: 12, color: s.text, marginTop: 2, opacity: 0.85, lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
