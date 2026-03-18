import jsPDF from 'jspdf'
import type { TriageResponse } from '../types'

const NIVEL_LABEL: Record<number, string> = {
  1: 'EMERGENCIA', 2: 'URGENTE', 3: 'SEMI-URGENTE', 4: 'NO URGENTE'
}

export async function exportarTriagePDF(triage: TriageResponse) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margen = 20
  const ancho = 170
  let y = 20

  const linea = () => {
    doc.setDrawColor(220, 220, 220)
    doc.line(margen, y, margen + ancho, y)
    y += 5
  }

  const texto = (txt: string, x: number, size = 10, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(color[0], color[1], color[2])
    doc.text(txt, x, y)
  }

  const salto = (n = 6) => { y += n }

  // Header
  doc.setFillColor(23, 95, 165)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Sistema de Triage Clínico', margen, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte de evaluación médica', margen, 20)
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 130, 20)
  y = 38

  // Datos del paciente
  texto('DATOS DEL PACIENTE', margen, 11, true, [23, 95, 165])
  salto(6)
  linea()

  const col1 = margen
  const col2 = margen + 90

  texto('Paciente:', col1, 9, true)
  texto(triage.nombrePaciente, col1 + 28, 9)
  texto('Documento:', col2, 9, true)
  texto(triage.numeroDocumento, col2 + 28, 9)
  salto(6)

  texto('Edad:', col1, 9, true)
  texto(`${triage.edad} años`, col1 + 28, 9)
  texto('Fecha:', col2, 9, true)
  texto(new Date(triage.fechaRegistro).toLocaleString('es-PE'), col2 + 28, 9)
  salto(6)

  texto('Registrado por:', col1, 9, true)
  texto(triage.usuarioRegistra || '—', col1 + 35, 9)
  salto(8)

  // Nivel de triage
  const nivelColores: Record<number, number[]> = {
    1: [220, 38, 38], 2: [234, 88, 12], 3: [37, 99, 235], 4: [22, 163, 74]
  }
  const color = nivelColores[triage.nivel] ?? [100, 100, 100]
  doc.setFillColor(color[0], color[1], color[2])
  doc.roundedRect(margen, y, ancho, 18, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`NIVEL ${triage.nivel} — ${NIVEL_LABEL[triage.nivel]}`, margen + 6, y + 7)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tiempo de atención: ${triage.tiempoAtencion}`, margen + 6, y + 13)
  y += 22

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const lineasRec = doc.splitTextToSize(triage.recomendacionClinica, ancho)
  doc.text(lineasRec, margen, y)
  y += lineasRec.length * 5 + 4

  // Alertas vitales
  if (triage.alertasVitales?.length > 0) {
    salto(2)
    texto('ALERTAS DE SIGNOS VITALES', margen, 11, true, [220, 38, 38])
    salto(6)
    linea()
    triage.alertasVitales.forEach(a => {
      doc.setFillColor(254, 226, 226)
      doc.roundedRect(margen, y - 4, ancho, 7, 1, 1, 'F')
      texto(`⚠ ${a}`, margen + 3, 9, false, [153, 27, 27])
      salto(8)
    })
  }

  // Signos vitales
  const tieneSignos = triage.temperatura || triage.frecuenciaCardiaca ||
    triage.saturacionOxigeno || triage.presionArterial ||
    triage.frecuenciaRespiratoria || triage.glucosa

  if (tieneSignos) {
    salto(2)
    texto('SIGNOS VITALES', margen, 11, true, [23, 95, 165])
    salto(6)
    linea()

    const signos = [
      { label: 'Temperatura', value: triage.temperatura ? `${triage.temperatura} °C` : null },
      { label: 'Frec. cardíaca', value: triage.frecuenciaCardiaca ? `${triage.frecuenciaCardiaca} lpm` : null },
      { label: 'Saturación O2', value: triage.saturacionOxigeno ? `${triage.saturacionOxigeno}%` : null },
      { label: 'Frec. respiratoria', value: triage.frecuenciaRespiratoria ? `${triage.frecuenciaRespiratoria} rpm` : null },
      { label: 'Presión arterial', value: triage.presionArterial ?? null },
      { label: 'Glucosa', value: triage.glucosa ? `${triage.glucosa} mg/dL` : null },
    ].filter(s => s.value)

    signos.forEach((s, i) => {
      const x = i % 2 === 0 ? col1 : col2
      if (i % 2 === 0 && i > 0) salto(6)
      texto(`${s.label}:`, x, 9, true)
      texto(s.value!, x + 38, 9)
    })
    salto(8)
  }

  // Síntomas
  if (triage.todosSintomas?.length > 0 || triage.signosAlarma?.length > 0) {
    salto(2)
    texto('SÍNTOMAS REGISTRADOS', margen, 11, true, [23, 95, 165])
    salto(6)
    linea()

    if (triage.signosAlarma?.length > 0) {
      texto('Signos de alarma:', margen, 9, true, [220, 38, 38])
      salto(5)
      const alarmas = triage.signosAlarma.join(', ')
      const lineasA = doc.splitTextToSize(alarmas, ancho)
      doc.setTextColor(153, 27, 27)
      doc.setFontSize(9)
      doc.text(lineasA, margen + 3, y)
      y += lineasA.length * 5 + 3
    }

    if (triage.todosSintomas?.length > 0) {
      texto('Otros síntomas:', margen, 9, true)
      salto(5)
      const sintomas = triage.todosSintomas.join(', ')
      const lineasS = doc.splitTextToSize(sintomas, ancho)
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(9)
      doc.text(lineasS, margen + 3, y)
      y += lineasS.length * 5 + 3
    }
    salto(4)
  }

  // Diagnósticos diferenciales
  if (triage.diagnosticosDiferenciales?.length > 0) {
    salto(2)
    texto('DIAGNÓSTICOS DIFERENCIALES', margen, 11, true, [23, 95, 165])
    salto(6)
    linea()

    triage.diagnosticosDiferenciales.forEach((d, i) => {
      if (y > 250) { doc.addPage(); y = 20 }

      doc.setFillColor(245, 247, 250)
      doc.roundedRect(margen, y - 3, ancho, 22, 2, 2, 'F')

      texto(`${i + 1}. ${d.nombre}`, margen + 3, 10, true)
      doc.setTextColor(37, 99, 235)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${d.probabilidad}%`, margen + ancho - 15, y)
      salto(6)

      doc.setTextColor(80, 80, 80)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`${d.grupo} — ${d.nivelUrgencia}`, margen + 3, y)
      salto(5)

      const lineasRec2 = doc.splitTextToSize(d.recomendacion, ancho - 6)
      doc.text(lineasRec2, margen + 3, y)
      y += lineasRec2.length * 4 + 6
    })
  }

  // Observaciones
  if (triage.observaciones) {
    salto(2)
    texto('OBSERVACIONES', margen, 11, true, [23, 95, 165])
    salto(6)
    linea()
    const lineasObs = doc.splitTextToSize(triage.observaciones, ancho)
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(9)
    doc.text(lineasObs, margen, y)
    y += lineasObs.length * 5 + 4
  }

  // Footer
  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text('Este documento es orientativo. La decisión clínica final corresponde al profesional de salud.', margen, 291)
    doc.text(`Página ${i} de ${totalPaginas}`, 185, 291)
  }

  doc.save(`triage_${triage.nombrePaciente.replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}