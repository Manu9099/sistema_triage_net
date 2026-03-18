import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { TriageResponse } from '../types'

export function exportarReporteExcel(triages: TriageResponse[], desde: string, hasta: string) {
  const datos = triages.map(t => ({
    'Fecha': new Date(t.fechaRegistro).toLocaleString('es-PE'),
    'Paciente': t.nombrePaciente,
    'Documento': t.numeroDocumento,
    'Edad': t.edad,
    'Nivel': t.nivel,
    'Clasificación': t.nivelDescripcion,
    'Tiempo atención': t.tiempoAtencion,
    'Inicio síntomas': t.inicioSintomas,
    'Temperatura (°C)': t.temperatura ?? '—',
    'Frec. cardíaca (lpm)': t.frecuenciaCardiaca ?? '—',
    'Saturación O2 (%)': t.saturacionOxigeno ?? '—',
    'Frec. respiratoria (rpm)': t.frecuenciaRespiratoria ?? '—',
    'Presión arterial': t.presionArterial ?? '—',
    'Glucosa (mg/dL)': t.glucosa ?? '—',
    'Alertas vitales': t.alertasVitales?.join(', ') ?? '—',
    'Signos de alarma': t.signosAlarma?.join(', ') ?? '—',
    'Síntomas': t.todosSintomas?.join(', ') ?? '—',
    'Diagnóstico principal': t.diagnosticosDiferenciales?.[0]?.nombre ?? '—',
    'Probabilidad (%)': t.diagnosticosDiferenciales?.[0]?.probabilidad ?? '—',
    'Diagnóstico 2': t.diagnosticosDiferenciales?.[1]?.nombre ?? '—',
    'Diagnóstico 3': t.diagnosticosDiferenciales?.[2]?.nombre ?? '—',
    'Recomendación': t.recomendacionClinica,
    'Observaciones': t.observaciones ?? '—',
    'Registrado por': t.usuarioRegistra,
  }))

  const resumen = [
    { 'Métrica': 'Total triages', 'Valor': triages.length },
    { 'Métrica': 'Emergencias (Nivel 1)', 'Valor': triages.filter(t => t.nivel === 1).length },
    { 'Métrica': 'Urgentes (Nivel 2)', 'Valor': triages.filter(t => t.nivel === 2).length },
    { 'Métrica': 'Semi-urgentes (Nivel 3)', 'Valor': triages.filter(t => t.nivel === 3).length },
    { 'Métrica': 'No urgentes (Nivel 4)', 'Valor': triages.filter(t => t.nivel === 4).length },
    { 'Métrica': 'Período desde', 'Valor': new Date(desde).toLocaleDateString('es-PE') },
    { 'Métrica': 'Período hasta', 'Valor': new Date(hasta).toLocaleDateString('es-PE') },
    { 'Métrica': 'Generado', 'Valor': new Date().toLocaleString('es-PE') },
  ]

  const wb = XLSX.utils.book_new()

  // Hoja resumen
  const wsResumen = XLSX.utils.json_to_sheet(resumen)
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // Hoja detalle
  const wsDetalle = XLSX.utils.json_to_sheet(datos)
  wsDetalle['!cols'] = [
    { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 8 },
    { wch: 8 }, { wch: 15 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 30 },
    { wch: 40 }, { wch: 30 }, { wch: 14 }, { wch: 25 },
    { wch: 25 }, { wch: 40 }, { wch: 30 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Triages')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/octet-stream' })
  const fechaArchivo = new Date().toISOString().slice(0, 10)
  saveAs(blob, `reporte_triage_${fechaArchivo}.xlsx`)
}