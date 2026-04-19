import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calcTotals, calcScore, getAlerts, STAGE_LABELS, TYPE_LABELS } from './logic.js'

export function exportPDF(startup) {
  const { name, stage, shareholders } = startup
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20
  let y = 20

  const t = calcTotals(shareholders)
  const score = calcScore(shareholders, stage)
  const alerts = getAlerts(shareholders, stage)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text('KVR CONSULTING · CAP TABLE HEALTH', margin, y)
  doc.setTextColor(180)
  doc.text(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), W - margin, y, { align: 'right' })
  y += 8

  doc.setDrawColor(220)
  doc.setLineWidth(0.4)
  doc.line(margin, y, W - margin, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(26)
  doc.text(name, margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Relatório de saúde do cap table · ${STAGE_LABELS[stage]}`, margin, y)
  y += 14

  const metrics = [
    ['Fundadores', `${t.founder.toFixed(1)}%`],
    ['Equity Pool', `${t.pool.toFixed(1)}%`],
    ['Investidores', `${t.investor.toFixed(1)}%`],
    ['Score de saúde', `${score}/100`],
  ]
  const boxW = (W - margin * 2 - 9) / 4
  metrics.forEach(([label, value], i) => {
    const x = margin + i * (boxW + 3)
    doc.setFillColor(247, 247, 245)
    doc.roundedRect(x, y, boxW, 18, 3, 3, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(label, x + boxW / 2, y + 6, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(26)
    doc.text(value, x + boxW / 2, y + 14, { align: 'center' })
  })
  y += 26

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(130)
  doc.text('SÓCIOS & PARTICIPAÇÕES', margin, y)
  y += 5

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Nome', 'Cargo / Tipo', 'Participação (%)', 'Vesting']],
    body: shareholders.map(s => [
      s.name,
      TYPE_LABELS[s.type] || s.type,
      `${parseFloat(s.pct).toFixed(1)}%`,
      s.vesting ? `${s.vestYears} anos / cliff ${s.cliffYears} ano` : 'Não',
    ]),
    foot: [['Total', '', `${t.total.toFixed(1)}%`, '']],
    styles: { fontSize: 10, cellPadding: 4, font: 'helvetica' },
    headStyles: { fillColor: [247, 247, 245], textColor: [80, 80, 80], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [247, 247, 245], textColor: [26, 26, 26], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 252, 250] },
    columnStyles: { 2: { halign: 'right' } },
  })

  y = doc.lastAutoTable.finalY + 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(130)
  doc.text('DIAGNÓSTICO E ALERTAS', margin, y)
  y += 6

  const levelColors = {
    danger: [163, 45, 45],
    warn:   [133, 79, 11],
    ok:     [59, 109, 17],
    info:   [24, 95, 165],
  }
  const levelBg = {
    danger: [252, 235, 235],
    warn:   [250, 238, 218],
    ok:     [234, 243, 222],
    info:   [230, 241, 251],
  }

  for (const alert of alerts) {
    const color = levelColors[alert.level] || levelColors.info
    const bg = levelBg[alert.level] || levelBg.info
    const boxH = 16 + Math.ceil(doc.splitTextToSize(alert.desc, W - margin * 2 - 14).length * 4.5)

    if (y + boxH > 270) { doc.addPage(); y = 20 }

    doc.setFillColor(...bg)
    doc.roundedRect(margin, y, W - margin * 2, boxH, 3, 3, 'F')
    doc.setFillColor(...color)
    doc.circle(margin + 5, y + 7, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...color)
    doc.text(alert.title, margin + 10, y + 7.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80)
    const lines = doc.splitTextToSize(alert.desc, W - margin * 2 - 14)
    doc.text(lines, margin + 10, y + 13)
    y += boxH + 4
  }

  y += 4
  if (y > 270) { doc.addPage(); y = 20 }
  doc.setDrawColor(220)
  doc.line(margin, y, W - margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(170)
  doc.text('KVR Consulting · Relatório gerado automaticamente pelo Cap Table Health · Apenas para referência, não configura assessoria jurídica.', margin, y)

  const filename = `${name.replace(/\s+/g, '_')}_CapTable_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
