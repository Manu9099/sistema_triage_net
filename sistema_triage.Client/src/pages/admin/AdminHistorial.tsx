import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { pacientesApi } from '../../api/pacientes'
import { triageApi } from '../../api/triage'
import type { Paciente, TriageResponse } from '../../types'
import { exportarTriagePDF } from '../../utils/exportarPDF'
import { ModalSeguimiento } from '../../components/ui/ModalSeguimiento'

const NIVEL_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: 'Emergencia', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
  2: { label: 'Urgente', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-500' },
  3: { label: 'Semi-urgente', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500' },
  4: { label: 'No urgente', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500' },
}

function TriageCard({
  triage,
  onSeguimiento,
}: {
  triage: TriageResponse
  onSeguimiento: (triage: TriageResponse) => void
}) {
  const [expandido, setExpandido] = useState(false)
  const cfg = NIVEL_CONFIG[triage.nivel] ?? NIVEL_CONFIG[4]

  const sintomasNormales = (triage.todosSintomas ?? []).filter(
    s => !(triage.signosAlarma ?? []).includes(s)
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <div className="text-left">
            <p className="text-sm font-medium text-white">
              {new Date(triage.fechaRegistro).toLocaleString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className={`text-xs mt-0.5 ${cfg.color}`}>
              Nivel {triage.nivel} — {cfg.label} · {triage.tiempoAtencion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {triage.diagnosticosDiferenciales?.[0] && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {triage.diagnosticosDiferenciales[0].nombre}
            </span>
          )}
          {expandido ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => exportarTriagePDF(triage)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition-colors"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar PDF
            </button>

            <button
              onClick={() => onSeguimiento(triage)}
              type="button"
              className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs rounded-lg transition-colors"
            >
              Seguimiento
            </button>
          </div>

          {triage.alertasVitales?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs font-medium text-red-400 mb-1">Alertas de signos vitales</p>
              <ul className="space-y-0.5">
                {triage.alertasVitales.map(a => (
                  <li key={a} className="text-xs text-red-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(triage.temperatura != null ||
            triage.frecuenciaCardiaca != null ||
            triage.saturacionOxigeno != null ||
            triage.presionArterial != null ||
            triage.frecuenciaRespiratoria != null ||
            triage.glucosa != null) && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Signos vitales</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {triage.temperatura != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.temperatura}°C</p>
                    <p className="text-xs text-gray-500">Temperatura</p>
                  </div>
                )}

                {triage.frecuenciaCardiaca != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.frecuenciaCardiaca}</p>
                    <p className="text-xs text-gray-500">FC (lpm)</p>
                  </div>
                )}

                {triage.saturacionOxigeno != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.saturacionOxigeno}%</p>
                    <p className="text-xs text-gray-500">SpO2</p>
                  </div>
                )}

                {triage.frecuenciaRespiratoria != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.frecuenciaRespiratoria}</p>
                    <p className="text-xs text-gray-500">FR (rpm)</p>
                  </div>
                )}

                {triage.presionArterial != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.presionArterial}</p>
                    <p className="text-xs text-gray-500">PA (mmHg)</p>
                  </div>
                )}

                {triage.glucosa != null && (
                  <div className="bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-semibold text-white">{triage.glucosa}</p>
                    <p className="text-xs text-gray-500">Glucosa</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(triage.signosAlarma?.length > 0 || sintomasNormales.length > 0) && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Síntomas registrados</p>
              <div className="flex flex-wrap gap-1.5">
                {triage.signosAlarma?.map(s => (
                  <span
                    key={s}
                    className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20"
                  >
                    {s}
                  </span>
                ))}

                {sintomasNormales.map(s => (
                  <span key={s} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {triage.diagnosticosDiferenciales?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Diagnósticos diferenciales</p>
              <div className="space-y-2">
                {triage.diagnosticosDiferenciales.map((d, index) => (
                  <div
                    key={`${d.codigo}-${index}`}
                    className="bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-white">{d.nombre}</p>
                      <span className="text-xs font-semibold text-blue-400">{d.probabilidad}%</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-1 mb-1.5">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${d.probabilidad}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">{d.recomendacion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {triage.observaciones && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Observaciones</p>
              <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3">
                {triage.observaciones}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-600">Registrado por: {triage.usuarioRegistra}</p>
        </div>
      )}
    </div>
  )
}

export function AdminHistorial() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteId, setPacienteId] = useState('')
  const [pacienteActual, setPacienteActual] = useState<Paciente | null>(null)
  const [triages, setTriages] = useState<TriageResponse[]>([])
  const [termino, setTermino] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPacientes, setLoadingPacientes] = useState(true)
  const [triageSeguimiento, setTriageSeguimiento] = useState<TriageResponse | null>(null)

  useEffect(() => {
    pacientesApi
      .getAllList()
      .then(setPacientes)
      .finally(() => setLoadingPacientes(false))
  }, [])

  const buscarPacientes = async () => {
    if (!termino.trim()) {
      const todos = await pacientesApi.getAllList()
      setPacientes(todos)
      return
    }

    const res = await (await pacientesApi.buscar(termino)).data
   setPacientes(res)
  }

  const seleccionarPaciente = async (p: Paciente) => {
    setPacienteId(p.id)
    setPacienteActual(p)
    setLoading(true)

    try {
      const hist = await triageApi.getByPaciente(p.id)
      setTriages(hist)
    } finally {
      setLoading(false)
    }
  }

  const nivelMasCritico =
    triages.length > 0 ? Math.min(...triages.map(t => t.nivel)) : null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Historial clínico</h2>
        <p className="text-gray-400 mt-1 text-sm">Historial completo de triages por paciente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={termino}
              onChange={e => setTermino(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarPacientes()}
              placeholder="Buscar paciente..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {loadingPacientes ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              </div>
            ) : (
              pacientes.map(p => (
                <button
                  key={p.id}
                  onClick={() => seleccionarPaciente(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    pacienteId === p.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 flex-shrink-0">
                      {p.nombres?.charAt(0) ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.nombreCompleto}</p>
                      <p className="text-xs text-gray-400">{p.numeroDocumento}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          {!pacienteActual ? (
            <div className="flex items-center justify-center h-64 text-gray-600">
              <div className="text-center">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecciona un paciente para ver su historial</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-medium text-blue-400 flex-shrink-0">
                      {pacienteActual.nombres?.charAt(0) ?? '?'}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {pacienteActual.nombreCompleto}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {pacienteActual.numeroDocumento} · {pacienteActual.edad} años ·{' '}
                        {pacienteActual.email ?? 'Sin email'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-semibold text-white">{triages.length}</p>
                    <p className="text-xs text-gray-400">triages totales</p>
                  </div>
                </div>

                {pacienteActual.alergias && pacienteActual.alergias !== 'Ninguna' && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-red-400 font-medium">Alergias: </span>
                    <span className="text-xs text-gray-300">{pacienteActual.alergias}</span>
                  </div>
                )}

                {pacienteActual.comorbilidades && pacienteActual.comorbilidades !== 'Ninguna' && (
                  <div className="mt-1">
                    <span className="text-xs text-yellow-400 font-medium">Comorbilidades: </span>
                    <span className="text-xs text-gray-300">{pacienteActual.comorbilidades}</span>
                  </div>
                )}

                {nivelMasCritico != null && (
                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${NIVEL_CONFIG[nivelMasCritico].dot}`} />
                    <p className="text-xs text-gray-400">
                      Nivel más crítico registrado:
                      <span className={`ml-1 font-medium ${NIVEL_CONFIG[nivelMasCritico].color}`}>
                        {NIVEL_CONFIG[nivelMasCritico].label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {triageSeguimiento && (
                <ModalSeguimiento
                  triage={triageSeguimiento}
                  onClose={() => setTriageSeguimiento(null)}
                  onRegistrado={() => setTriageSeguimiento(null)}
                />
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : triages.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-sm">Este paciente no tiene triages registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {triages.map(t => (
                    <TriageCard
                      key={t.id}
                      triage={t}
                      onSeguimiento={setTriageSeguimiento}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}