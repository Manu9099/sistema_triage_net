import { useState, useEffect } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { citasApi } from '../../api/citas'
import type { Cita, SlotDisponibilidad, SolicitarCitaDto } from '../../types'
import {  hoyLocal } from '../../utils/fechas'
// Necesita importar Plus
import { Plus } from 'lucide-react'

const ESTADO_CONFIG: Record<number, { label: string; color: string; bg: string; border: string }> = {
  0: { label: 'Pendiente',    color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  1: { label: 'Confirmada',   color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  2: { label: 'Cancelada',    color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  3: { label: 'Reprogramada', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  4: { label: 'Completada',   color: 'text-gray-700',   bg: 'bg-gray-50',   border: 'border-gray-200' },
}

function ModalSolicitarCita({ onClose, onSolicitada }: {
  onClose: () => void
  onSolicitada: (c: Cita) => void
}) {
  const hoy = hoyLocal()
  const enUnMes = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [slots, setSlots] = useState<SlotDisponibilidad[]>([])
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [cargandoSlots, setCargandoSlots] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    citasApi.getSlotsDisponibles(
      new Date(hoy).toISOString(),
      new Date(enUnMes + 'T23:59:59').toISOString()
    )
      .then(setSlots)
      .finally(() => setCargandoSlots(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotSeleccionado) { setError('Selecciona un horario'); return }
    setLoading(true)
    setError('')
    try {
      const dto: SolicitarCitaDto = { slotId: slotSeleccionado, motivoConsulta: motivo || undefined }
      const cita = await citasApi.solicitarCita(dto)
      onSolicitada(cita)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al solicitar cita')
    } finally {
      setLoading(false)
    }
  }

  // Agrupar slots por fecha
  const slotsPorFecha = slots.reduce((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = []
    acc[s.fecha].push(s)
    return acc
  }, {} as Record<string, SlotDisponibilidad[]>)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Solicitar cita</h3>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-red-600 text-sm">{error}</p></div>}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Selecciona un horario disponible</label>
            {cargandoSlots ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : Object.keys(slotsPorFecha).length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Calendar size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No hay horarios disponibles por ahora</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(slotsPorFecha).map(([fecha, slotsDelDia]) => (
                  <div key={fecha}>
                    <p className="text-xs font-medium text-gray-500 mb-2">{fecha}</p>
                    <div className="flex flex-wrap gap-2">
                      {slotsDelDia.map(s => (
                        <button key={s.id} type="button" onClick={() => setSlotSeleccionado(s.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${
                            slotSeleccionado === s.id
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          <Clock size={12} />
                          {s.hora}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Motivo de consulta (opcional)</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
              placeholder="Describe brevemente el motivo de tu consulta..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl">Cancelar</button>
            <button type="submit" disabled={loading || !slotSeleccionado}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl">
              {loading ? 'Solicitando...' : 'Solicitar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PacienteCitas() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const horasHastaCita = (fechaHoraInicio: string) =>
  (new Date(fechaHoraInicio).getTime() - Date.now()) / 3600000

const cancelarCita = async (citaId: string) => {
  if (!confirm('¿Seguro que quieres cancelar esta cita?')) return
  try {
    await citasApi.cancelarPorPaciente(citaId)
    setCitas(prev => prev.map(c =>
      c.id === citaId ? { ...c, estado: 2, estadoDescripcion: 'Cancelada' } : c
    ))
  } catch (err: any) {
    alert(err?.response?.data?.mensaje ?? 'Error al cancelar la cita')
  }
}

  useEffect(() => {
    citasApi.getMisCitas()
      .then(setCitas)
      .finally(() => setLoading(false))
  }, [])

  const onSolicitada = (c: Cita) => setCitas(prev => [c, ...prev])

const proximas = citas.filter(c => c.estado === 0 || c.estado === 1 || c.estado === 3)
const anteriores = citas.filter(c => c.estado === 2 || c.estado === 4)

  return (
    <div className="max-w-2xl">
      {modalAbierto && (
        <ModalSolicitarCita
          onClose={() => setModalAbierto(false)}
          onSolicitada={onSolicitada}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Mis citas</h2>
          <p className="text-gray-500 mt-1 text-sm">Agenda y gestión de citas médicas</p>
        </div>
        <button onClick={() => setModalAbierto(true)} type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={16} />
          Nueva cita
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : citas.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">No tienes citas registradas</p>
          <button onClick={() => setModalAbierto(true)} type="button"
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl">
            Solicitar primera cita
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {proximas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">PRÓXIMAS CITAS</p>
              <div className="space-y-3">
                {proximas.map(c => {
                  const cfg = ESTADO_CONFIG[c.estado]
                    // En el map de proximas citas, agrega este botón
{(c.estado === 0 || c.estado === 1) && horasHastaCita(c.fechaHoraInicio) >= 24 && (
  <button onClick={() => cancelarCita(c.id)} type="button"
    className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
      c.estado === 0
        ? 'border-red-200 text-red-500 hover:bg-red-50'
        : 'border-orange-200 text-orange-500 hover:bg-orange-50'
    }`}>
    Cancelar
  </button>
)}

                  return (
                    <div key={c.id} className={`border-2 rounded-2xl p-5 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
                              <Calendar size={14} />{c.fecha}
                            </span>
                            <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
                              <Clock size={14} />{c.hora}
                            </span>
                          </div>
                          {c.motivoConsulta && (
                            <p className={`text-xs mt-2 ${cfg.color} opacity-80`}>Motivo: {c.motivoConsulta}</p>
                          )}
                          {c.notasStaff && (
                            <p className={`text-xs mt-1 ${cfg.color} opacity-80`}>Indicaciones: {c.notasStaff}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {anteriores.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">HISTORIAL</p>
              <div className="space-y-2">
                {anteriores.map(c => {
                  const cfg = ESTADO_CONFIG[c.estado]
                  return (
                    <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{c.fecha} — {c.hora}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </div>
                            {c.motivoRechazo && (
                              <p className="text-xs text-red-500 mt-0.5">Motivo: {c.motivoRechazo}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

