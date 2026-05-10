// src/utils/generateLeavePDF.js
import jsPDF from 'jspdf'
import FORM_IMAGE_B64 from './leaveFormImage'

const W = 210
const H = 297
const PX = (px) => px * (W / 1654)
const PY = (py) => py * (H / 2338)

const val = (v, fb = '') => (v != null && v !== '') ? String(v) : fb

function splitDate(iso) {
  if (!iso) return { d: '', m: '', y2: '' }
  const [y, m, d] = String(iso).split('-')
  return { d: d ?? '', m: m ?? '', y2: (y ?? '').slice(2) }
}

// ── core builder ──────────────────────────────────────────────────────────
function buildDoc(row) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  doc.addImage(FORM_IMAGE_B64, 'JPEG', 0, 0, W, H)
  doc.setTextColor(20, 20, 20)

  function put(text, px, py, { size = 9, bold = false, color } = {}) {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    if (color) doc.setTextColor(...color)
    doc.text(val(text), PX(px), PY(py))
    if (color) doc.setTextColor(20, 20, 20)
  }

  put(row.employee_name_kh,  295, 278)
  put(row.employee_name_en,  832, 278)
  put(row.employee_code,    1460, 278)

  put(row.employee_code,     140, 338)
  put(row.office_name,       452, 338)
  put(row.position_name,    1132, 338)

  put(row.employee_phone, 440, 452)

  put(row.leave_type_name, 614, 638, { size: 8.5 })
  put(`${val(row.duration_value)} ${val(row.duration_unit_name_kh)}`, 888, 638, { size: 8.5 })

  const s = splitDate(row.start_date)
  put(s.d,  1012, 638, { size: 8.5 })
  put(s.m,  1148, 638, { size: 8.5 })
  put(s.y2, 1282, 638, { size: 8.5 })

  const reasonLines = doc.splitTextToSize(val(row.description), PX(1165))
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(reasonLines, PX(346), PY(700))

  const e = splitDate(row.end_date)
  put(e.d,   790, 762, { size: 8.5 })
  put(e.m,   930, 762, { size: 8.5 })
  put(e.y2, 1070, 762, { size: 8.5 })

  if (row.approve_by_name) {
    put(row.approve_by_name, 432, 1385, { size: 8.5 })
  }

  const STAMP_COLOR = { 1:[210,105,10], 2:[0,140,55], 3:[180,20,20], 4:[90,90,90] }
  if (row.status_leave_name) {
    const [r, g, b] = STAMP_COLOR[row.status_leave_id] ?? [80, 80, 80]
    const sx = PX(1060), sy = PY(1280), sw = 46, sh = 13
    doc.setDrawColor(r, g, b)
    doc.setLineWidth(0.9)
    doc.roundedRect(sx, sy, sw, sh, 2, 2)
    doc.setTextColor(r, g, b)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.text(row.status_leave_name, sx + sw / 2, sy + 8.5, { align: 'center' })
    doc.setTextColor(20, 20, 20)
    doc.setDrawColor(0)
  }

  return doc
}

// ── preview: returns a temporary blob URL for <iframe> ───────────────────
export function previewLeavePDF(row) {
  const doc = buildDoc(row)
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)   // revoke this URL when dialog closes
}

// ── download: saves file to disk ─────────────────────────────────────────
export function downloadLeavePDF(row) {
  const doc = buildDoc(row)
  const filename = `leave_${val(row.employee_code, 'form')}_${val(row.start_date, 'date')}.pdf`
  doc.save(filename)
}