import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle } from 'lucide-react'
import { seguimientoApi } from '../../api/seguimiento'
import type { TriageResponse, SeguimientoResponse, RegistrarSeguimientoDto } from '../../types'

const NIVELES = ['', 'Emergencia', 'Urgente', 'Semi-urgente', 'No urgente']
const NIVEL_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-blue-500', 'text-green-500']

export function ModalSeguimiento({ triage, onClose, onRegistrado }: {
  triage: TriageResponse
  onClose: () => void
  onRegistrado: (s: SeguimientoResponse) => void
}) {
  const [seguimientoExistente, setSeguimientoExistente] = useState<SeguimientoResponse | null>(null)
  const [cargando, setCargando] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<RegistrarSeguimientoDto>({
    triageId: triage.id,
    fueAtendido: true,
    diagnosticoConfirmado: '',
    nivelTriageCorrecto: true,
    nivelTriageReal: undefined,
    observaciones: '',
    medicamentosIndicados: '',
  })

  useEffect(() => {
    seguimientoApi.getByTriage(triage.id)
      .then(setSeguimientoExistente)
      .finally(() => setCargando(false))
  }, [triage.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await seguimientoApi.registrar(form)
      onRegistrado(result)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al registrar seguimiento')
    } finally {
      setLoading(false)
    }
  }

  const nivelOriginal = triage.nivel ?? triage.nivel ?? 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Seguimiento post-triage</h3>
            <p className="text-sm text-gray-400 mt-0.5">{triage.nombrePaciente}</p>
          </div>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          {cargando ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : seguimientoExistente ? (
            // Vista de seguimiento ya registrado
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm font-medium mb-1">✓ Seguimiento registrado</p>
                <p className="text-gray-400 text-xs">{new Date(seguimientoExistente.fechaRegistro).toLocaleString('es-PE')}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400">¿Fue atendido?</span>
                  {seguimientoExistente.fueAtendido
                    ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle size={12} /> Sí</span>
                    : <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle size={12} /> No</span>}
                </div>
                {seguimientoExistente.diagnosticoConfirmado && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-xs text-gray-400">Diagnóstico confirmado</span>
                    <span className="text-white text-xs">{seguimientoExistente.diagnosticoConfirmado}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400">Nivel triage correcto</span>
                  {seguimientoExistente.nivelTriageCorrecto
                    ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle size={12} /> Correcto</span>
                    : <span className="text-xs">
                        <span className="text-red-400">Incorrecto</span>
                        {seguimientoExistente.nivelTriageReal && (
                          <span className={`ml-2 ${NIVEL_COLORS[seguimientoExistente.nivelTriageReal]}`}>
                            → Nivel {seguimientoExistente.nivelTriageReal} ({NIVELES[seguimientoExistente.nivelTriageReal]})
                          </span>
                        )}
                      </span>}
                </div>
                {seguimientoExistente.medicamentosIndicados && (
                  <div className="py-2 border-b border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Medicamentos</p>
                    <p className="text-white text-xs">{seguimientoExistente.medicamentosIndicados}</p>
                  </div>
                )}
                {seguimientoExistente.observaciones && (
                  <div className="py-2">
                    <p className="text-xs text-gray-400 mb-1">Observaciones</p>
                    <p className="text-white text-xs">{seguimientoExistente.observaciones}</p>
                  </div>
                )}
              </div>

              <button onClick={onClose} type="button"
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg">
                Cerrar
              </button>
            </div>
          ) : (
            // Formulario de registro
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-red-400 text-sm">{error}</p></div>}

              {/* Info del triage */}
              <div className="bg-gray-800 rounded-xl p-4 text-xs space-y-1">
                <p className="text-gray-400">Triage del {new Date(triage.fechaRegistro).toLocaleDateString('es-PE')}</p>
                <p className="text-white">Nivel original: <span className={NIVEL_COLORS[nivelOriginal]}>{NIVELES[nivelOriginal]}</span></p>
                {triage.diagnosticosDiferenciales?.[0] && (
                  <p className="text-gray-400">Diagnóstico sugerido: <span className="text-white">{triage.diagnosticosDiferenciales[0].nombre}</span></p>
                )}
              </div>

              {/* ¿Fue atendido? */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">¿El paciente fue atendido? *</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button"
                      onClick={() => setForm(p => ({ ...p, fueAtendido: v }))}
                      className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors ${
                        form.fueAtendido === v
                          ? v ? 'bg-green-500/20 border-green-500/40 text-green-300'
                              : 'bg-red-500/20 border-red-500/40 text-red-300'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}>
                      {v ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnóstico confirmado */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Diagnóstico confirmado por médico</label>
                <input value={form.diagnosticoConfirmado} onChange={e => setForm(p => ({ ...p, diagnosticoConfirmado: e.target.value }))}
                  placeholder="Ej: Neumonía bacteriana, Gastritis aguda..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* ¿Nivel correcto? */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">¿El nivel de triage fue correcto?</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button"
                      onClick={() => setForm(p => ({ ...p, nivelTriageCorrecto: v, nivelTriageReal: v ? undefined : p.nivelTriageReal }))}
                      className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors ${
                        form.nivelTriageCorrecto === v
                          ? v ? 'bg-green-500/20 border-green-500/40 text-green-300'
                              : 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}>
                      {v ? 'Correcto' : 'Incorrecto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nivel real si fue incorrecto */}
              {!form.nivelTriageCorrecto && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Nivel de triage real</label>
                  <select value={form.nivelTriageReal ?? ''}
                    onChange={e => setForm(p => ({ ...p, nivelTriageReal: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Seleccionar nivel</option>
                    <option value={1}>Nivel 1 — Emergencia</option>
                    <option value={2}>Nivel 2 — Urgente</option>
                    <option value={3}>Nivel 3 — Semi-urgente</option>
                    <option value={4}>Nivel 4 — No urgente</option>
                  </select>
                </div>
              )}

              {/* Medicamentos */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Medicamentos indicados</label>
                <input value={form.medicamentosIndicados} onChange={e => setForm(p => ({ ...p, medicamentosIndicados: e.target.value }))}
                  placeholder="Ej: Amoxicilina 500mg, Ibuprofeno 400mg..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                  rows={2} placeholder="Notas adicionales del médico..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                  {loading ? 'Registrando...' : 'Registrar seguimiento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}