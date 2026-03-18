import { useState, useEffect } from 'react'
import { triageApi } from '../../api/triage'
import { exportarTriagePDF } from '../../utils/exportarPDF'
import {ClipboardList ,ChevronDown, ChevronUp } from 'lucide-react'
import type { TriageResponse } from '../../types'
import { usePacientePerfil } from '../../hooks/usePacientePerfil'

const NIVEL_CONFIG: Record<number, { label: string; color: string; bg: string; border: string; dot: string }> = {
  1: { label: 'Emergencia',   color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500' },
  2: { label: 'Urgente',      color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  3: { label: 'Semi-urgente', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  4: { label: 'No urgente',   color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500' },
}

function TriageCard({ triage }: { triage: TriageResponse }) {
  const [expandido, setExpandido] = useState(false)
  const cfg = NIVEL_CONFIG[triage.nivel]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {new Date(triage.fechaRegistro).toLocaleDateString('es-PE', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
            <p className={`text-xs mt-0.5 ${cfg.color}`}>
              {cfg.label} — {triage.tiempoAtencion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {triage.diagnosticosDiferenciales?.[0] && (
            <span className="text-xs text-gray-400 hidden sm:block max-w-32 truncate">
              {triage.diagnosticosDiferenciales[0].nombre}
            </span>
          )}
          {expandido ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Nivel */}
          <div className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
            <p className={`font-semibold ${cfg.color}`}>
              Nivel {triage.nivel} — {cfg.label}
            </p>
            <p className={`text-sm mt-1 ${cfg.color} opacity-80`}>{triage.recomendacionClinica}</p>
          </div>

          {/* Alertas vitales */}
          {triage.alertasVitales?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Alertas de signos vitales</p>
              {triage.alertasVitales.map(a => (
                <p key={a} className="text-xs text-red-600">• {a}</p>
              ))}
            </div>
          )}

          {/* Signos vitales */}
          {(triage.temperatura || triage.frecuenciaCardiaca || triage.saturacionOxigeno ||
            triage.presionArterial || triage.frecuenciaRespiratoria || triage.glucosa) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">SIGNOS VITALES</p>
              <div className="grid grid-cols-3 gap-2">
                {triage.temperatura && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.temperatura}°C</p>
                    <p className="text-xs text-gray-400">Temperatura</p>
                  </div>
                )}
                {triage.frecuenciaCardiaca && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.frecuenciaCardiaca}</p>
                    <p className="text-xs text-gray-400">FC (lpm)</p>
                  </div>
                )}
                {triage.saturacionOxigeno && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.saturacionOxigeno}%</p>
                    <p className="text-xs text-gray-400">SpO2</p>
                  </div>
                )}
                {triage.presionArterial && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.presionArterial}</p>
                    <p className="text-xs text-gray-400">Presión</p>
                  </div>
                )}
                {triage.frecuenciaRespiratoria && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.frecuenciaRespiratoria}</p>
                    <p className="text-xs text-gray-400">FR (rpm)</p>
                  </div>
                )}
                {triage.glucosa && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">{triage.glucosa}</p>
                    <p className="text-xs text-gray-400">Glucosa</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnósticos */}
          {triage.diagnosticosDiferenciales?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">POSIBLES CONDICIONES</p>
              <div className="space-y-2">
                {triage.diagnosticosDiferenciales.map(d => (
                  <div key={d.codigo} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-900">{d.nombre}</p>
                      <span className="text-sm font-semibold text-blue-600">{d.probabilidad}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${d.probabilidad}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{d.recomendacion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">Evaluado por {triage.usuarioRegistra || 'sistema'}</p>
            <button onClick={() => exportarTriagePDF(triage)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PacienteHistorial() {
  const { paciente } = usePacientePerfil()
  const [triages, setTriages] = useState<TriageResponse[]>([])
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  if (!paciente?.id) return
  triageApi.getByPaciente(paciente.id)
    .then(setTriages)
    .finally(() => setLoading(false))
}, [paciente])

  const stats = {
    total: triages.length,
    emergencias: triages.filter(t => t.nivel <= 2).length,
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Mi historial</h2>
        <p className="text-gray-500 mt-1 text-sm">Todas tus evaluaciones médicas</p>
      </div>

      {!loading && triages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">Evaluaciones totales</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-orange-600">{stats.emergencias}</p>
            <p className="text-xs text-gray-400 mt-1">Casos urgentes</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : triages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tienes evaluaciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {triages.map(t => <TriageCard key={t.id} triage={t} />)}
        </div>
      )}
    </div>
  )
}