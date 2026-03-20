import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, X, Check, Ban, RefreshCw } from 'lucide-react'
import { citasApi } from '../../api/citas'
import type { Cita, SlotDisponibilidad, CrearSlotDto, GestionarCitaDto } from '../../types'
import { toLocalISOString, hoyLocal } from '../../utils/fechas'

const ESTADO_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  0: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' },
  1: { label: 'Confirmada', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500' },
  2: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
  3: { label: 'Reprogramada', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500' },
  4: { label: 'Completada', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', dot: 'bg-gray-500' },
}

function sumarDiasLocal(fecha: string, dias: number): string {
  const [year, month, day] = fecha.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + dias)

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${y}-${m}-${dd}`
}

function ModalCrearSlots({
  onClose,
  onCreado,
}: {
  onClose: () => void
  onCreado: () => void
}) {
  const [form, setForm] = useState<CrearSlotDto>({
    fechaHoraInicio: '',
    duracionMinutos: 30,
    cantidadSlots: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.fechaHoraInicio) {
      setError('Selecciona fecha y hora de inicio')
      return
    }

    setLoading(true)
    setError('')

    try {
      await citasApi.crearSlots(form)
      onCreado()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al crear slots')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Crear slots de disponibilidad</h3>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              value={form.fechaHoraInicio}
              onChange={e => setForm(p => ({ ...p, fechaHoraInicio: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Duración por slot (minutos)
            </label>
            <select
              value={form.duracionMinutos}
              onChange={e => setForm(p => ({ ...p, duracionMinutos: parseInt(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={15}>15 minutos</option>
              <option value={20}>20 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Cantidad de slots consecutivos
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.cantidadSlots}
              onChange={e => setForm(p => ({ ...p, cantidadSlots: parseInt(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se crearán {form.cantidadSlots} slot{form.cantidadSlots > 1 ? 's' : ''} de{' '}
              {form.duracionMinutos} min cada uno
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              {loading ? 'Creando...' : 'Crear slots'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalGestionarCita({
  cita,
  onClose,
  onGestionada,
}: {
  cita: Cita
  onClose: () => void
  onGestionada: (c: Cita) => void
}) {
  const [accion, setAccion] = useState('')
  const [notas, setNotas] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slotsDisponibles, setSlotsDisponibles] = useState<SlotDisponibilidad[]>([])
  const [nuevoSlotId, setNuevoSlotId] = useState('')
  const [cargandoSlots, setCargandoSlots] = useState(false)

  useEffect(() => {
    setError('')
    setNuevoSlotId('')
    setSlotsDisponibles([])

    if (accion === 'reprogramar') {
      const hoy = hoyLocal()
      const enUnMes = sumarDiasLocal(hoy, 30)

      setCargandoSlots(true)

      citasApi
        .getSlotsDisponibles(toLocalISOString(hoy, false), toLocalISOString(enUnMes, true))
        .then(setSlotsDisponibles)
        .catch(() => setSlotsDisponibles([]))
        .finally(() => setCargandoSlots(false))
    }
  }, [accion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accion) {
      setError('Selecciona una acción')
      return
    }

    if (accion === 'reprogramar' && !nuevoSlotId) {
      setError('Debes seleccionar un nuevo horario')
      return
    }

    setLoading(true)
    setError('')

    try {
      const dto: GestionarCitaDto = {
        accion,
        notasStaff: notas || undefined,
        motivoRechazo: motivo || undefined,
        nuevoSlotId: accion === 'reprogramar' ? nuevoSlotId : undefined,
      }

      const actualizada = await citasApi.gestionarCita(cita.id, dto)
      onGestionada(actualizada)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al gestionar cita')
    } finally {
      setLoading(false)
    }
  }

  const cfg = ESTADO_CONFIG[cita.estado]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Gestionar cita</h3>
            <p className="text-sm text-gray-400 mt-0.5">{cita.nombrePaciente}</p>
          </div>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className={`border rounded-xl p-4 mb-5 ${cfg.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-white font-medium">
              {cita.fecha} — {cita.hora}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {cita.motivoConsulta ?? 'Sin motivo indicado'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Acción *</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'confirmar', label: 'Confirmar', icon: Check, color: 'green' },
                  { value: 'cancelar', label: 'Cancelar', icon: Ban, color: 'red' },
                  { value: 'completar', label: 'Completar', icon: Check, color: 'blue' },
                  { value: 'reprogramar', label: 'Reprogramar', icon: RefreshCw, color: 'yellow' },
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAccion(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                      accion === value
                        ? color === 'green'
                          ? 'bg-green-500/20 border-green-500/40 text-green-300'
                          : color === 'red'
                            ? 'bg-red-500/20 border-red-500/40 text-red-300'
                            : color === 'blue'
                              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                              : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {accion === 'cancelar' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Motivo de cancelación
                </label>
                <input
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Paciente no se presentó..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {(accion === 'confirmar' || accion === 'completar') && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Notas del staff
                </label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={2}
                  placeholder="Indicaciones, observaciones..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            )}

            {accion === 'reprogramar' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nuevo horario *
                </label>

                {cargandoSlots ? (
                  <div className="flex justify-center py-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                  </div>
                ) : slotsDisponibles.length === 0 ? (
                  <p className="text-xs text-gray-500">No hay slots disponibles</p>
                ) : (
                  <select
                    value={nuevoSlotId}
                    onChange={e => setNuevoSlotId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar nuevo horario...</option>
                    {slotsDisponibles.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fecha} — {s.hora}
                      </option>
                    ))}
                  </select>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 mt-3">
                    Notas
                  </label>
                  <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    rows={2}
                    placeholder="Motivo de la reprogramación..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !accion}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
              >
                {loading ? 'Procesando...' : 'Aplicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function AdminCitas() {
  const hoy = hoyLocal()

  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [citas, setCitas] = useState<Cita[]>([])
  const [slots, setSlots] = useState<SlotDisponibilidad[]>([])
  const [pendientes, setPendientes] = useState<Cita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalSlots, setModalSlots] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [vista, setVista] = useState<'citas' | 'slots'>('citas')

  useEffect(() => {
    cargarPendientes()
    buscar()
  }, [])

  const cargarPendientes = async () => {
    try {
      const data = await citasApi.getPendientes()
      setPendientes(data)
    } catch {
      setPendientes([])
    }
  }

  const buscar = async () => {
    setError('')
    setLoading(true)

    try {
      const [citasData, slotsData] = await Promise.all([
        citasApi.getReporte(toLocalISOString(desde, false), toLocalISOString(hasta, true)),
        citasApi.getSlotsDisponibles(toLocalISOString(desde, false), toLocalISOString(hasta, true)),
      ])

      setCitas(citasData)
      setSlots(slotsData)
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'No se pudo cargar la agenda')
      setCitas([])
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const onGestionada = (citaActualizada: Cita) => {
    setCitas(prev => prev.map(c => (c.id === citaActualizada.id ? citaActualizada : c)))
    setPendientes(prev => prev.filter(c => c.id !== citaActualizada.id))
  }

  const eliminarSlot = async (id: string) => {
    try {
      await citasApi.eliminarSlot(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } catch {
      alert('No se puede eliminar un slot con cita asignada')
    }
  }

  return (
    <div className="p-8">
      {modalSlots && (
        <ModalCrearSlots
          onClose={() => setModalSlots(false)}
          onCreado={() => {
            setModalSlots(false)
            buscar()
          }}
        />
      )}

      {citaSeleccionada && (
        <ModalGestionarCita
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onGestionada={onGestionada}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Citas</h2>
          <p className="text-gray-400 mt-1 text-sm">Gestión de agenda y disponibilidad</p>
        </div>

        <button
          onClick={() => setModalSlots(true)}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Agregar disponibilidad
        </button>
      </div>

      {pendientes.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-yellow-400 mb-3">
            {pendientes.length} cita{pendientes.length > 1 ? 's' : ''} pendiente
            {pendientes.length > 1 ? 's' : ''} de confirmación
          </p>

          <div className="space-y-2">
            {pendientes.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{c.nombrePaciente}</p>
                    <p className="text-xs text-gray-400">
                      {c.fecha} — {c.hora} · {c.motivoConsulta ?? 'Sin motivo'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCitaSeleccionada(c)}
                  type="button"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={buscar}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setVista('citas')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                vista === 'citas' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Citas ({citas.length})
            </button>
            <button
              onClick={() => setVista('slots')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                vista === 'slots' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Slots disponibles ({slots.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {vista === 'citas' &&
        (citas.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay citas en el rango seleccionado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citas.map(c => {
              const cfg = ESTADO_CONFIG[c.estado]

              return (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{c.nombrePaciente}</p>
                        <p className="text-xs text-gray-400">
                          {c.numeroDocumento} · {c.emailPaciente ?? '—'}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <Calendar size={11} />
                            {c.fecha}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <Clock size={11} />
                            {c.hora}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-xs border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {c.motivoConsulta && (
                          <p className="text-xs text-gray-500 mt-1">Motivo: {c.motivoConsulta}</p>
                        )}
                        {c.notasStaff && (
                          <p className="text-xs text-gray-500 mt-0.5">Notas: {c.notasStaff}</p>
                        )}
                        {c.motivoRechazo && (
                          <p className="text-xs text-red-400 mt-0.5">Cancelación: {c.motivoRechazo}</p>
                        )}
                      </div>
                    </div>

                    {(c.estado === 0 || c.estado === 1) && (
                      <button
                        onClick={() => setCitaSeleccionada(c)}
                        type="button"
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                      >
                        Gestionar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {vista === 'slots' &&
        (slots.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Clock size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay slots disponibles en el rango seleccionado</p>
            <button
              onClick={() => setModalSlots(true)}
              type="button"
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
            >
              Crear disponibilidad
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Hora</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Staff</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {slots.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-300">{s.fecha}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{s.hora}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{s.nombreStaff}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs ${
                          s.disponible ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {s.disponible ? 'Disponible' : 'Ocupado'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {s.disponible && (
                        <button
                          onClick={() => eliminarSlot(s.id)}
                          type="button"
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  )
}