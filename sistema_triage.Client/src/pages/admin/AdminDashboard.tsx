import { useState, useEffect, useRef } from 'react'
import { Users, ClipboardList, Clock, AlertTriangle, Activity, Wifi, WifiOff } from 'lucide-react'
import * as signalR from '@microsoft/signalr'
import { dashboardApi } from '../../api/dashboard'
import type { DashboardStats, PacienteEspera } from '../../types'

const NIVEL_CONFIG = {
  1: { label: 'Emergencia',   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-500',    ring: 'ring-red-500/30' },
  2: { label: 'Urgente',      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', ring: 'ring-orange-500/30' },
  3: { label: 'Semi-urgente', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'bg-blue-500',   ring: 'ring-blue-500/30' },
  4: { label: 'No urgente',   color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'bg-green-500',  ring: 'ring-green-500/30' },
} as const

export function AdminDashboard() {
  const token = localStorage.getItem('accessToken') ?? ''
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salaEspera, setSalaEspera] = useState<PacienteEspera[]>([])
  const [loading, setLoading] = useState(true)
  const [conectado, setConectado] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    cargarDatos()
    conectarSignalR()
    const intervalo = setInterval(cargarDatos, 30000)
    return () => {
      clearInterval(intervalo)
      connectionRef.current?.stop()
    }
  }, [])

  const cargarDatos = async () => {
    try {
      const [statsData, salaData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSalaEspera()
      ])
      setStats(statsData)
      setSalaEspera(salaData)
      setUltimaActualizacion(new Date())
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const conectarSignalR = async () => {
    if (!token) return
    const apiUrl = import.meta.env.VITE_API_URL ?? ''
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/triage`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build()

    connection.on('ActualizarDashboard', (data: DashboardStats) => {
      setStats(data)
      setUltimaActualizacion(new Date())
    })

    connection.on('ActualizarSalaEspera', (data: PacienteEspera[]) => {
      setSalaEspera(data)
    })

    connection.on('NuevoTriage', () => cargarDatos())

    connection.onreconnected(() => {
      setConectado(true)
      connection.invoke('UnirseGrupoAdmin').catch(() => {})
    })

    connection.onclose(() => setConectado(false))

    try {
      await connection.start()
      await connection.invoke('UnirseGrupoAdmin')
      setConectado(true)
      connectionRef.current = connection
    } catch {
      setConectado(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1 text-sm">
            {ultimaActualizacion
              ? `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-PE')}`
              : 'Cargando...'}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
          conectado ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'
        }`}>
          {conectado ? <Wifi size={12} /> : <WifiOff size={12} />}
          {conectado ? 'En vivo' : 'Desconectado'}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Triages hoy',     value: stats?.totalTriagesHoy ?? 0,  icon: ClipboardList, color: 'blue' },
          { label: 'Emergencias',     value: stats?.emergencias ?? 0,       icon: AlertTriangle, color: 'red' },
          { label: 'Urgentes',        value: stats?.urgentes ?? 0,          icon: Activity,      color: 'orange' },
          { label: 'Tiempo promedio', value: `${Math.round(stats?.tiempoPromedioEsperaMinutos ?? 0)} min`, icon: Clock, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
              color === 'blue' ? 'bg-blue-500/10' :
              color === 'red' ? 'bg-red-500/10' :
              color === 'orange' ? 'bg-orange-500/10' : 'bg-purple-500/10'
            }`}>
              <Icon size={18} className={
                color === 'blue' ? 'text-blue-400' :
                color === 'red' ? 'text-red-400' :
                color === 'orange' ? 'text-orange-400' : 'text-purple-400'
              } />
            </div>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Barra de niveles */}
      {stats && (stats.emergencias + stats.urgentes + stats.semiUrgentes + stats.noUrgentes) > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-400 mb-3">Distribución por nivel hoy</p>
          <div className="flex rounded-full overflow-hidden h-3 mb-3">
            {[
              { val: stats.emergencias,  color: 'bg-red-500' },
              { val: stats.urgentes,     color: 'bg-orange-500' },
              { val: stats.semiUrgentes, color: 'bg-blue-500' },
              { val: stats.noUrgentes,   color: 'bg-green-500' },
            ].map(({ val, color }, i) => {
              const total = stats.emergencias + stats.urgentes + stats.semiUrgentes + stats.noUrgentes
              const pct = total > 0 ? (val / total) * 100 : 0
              return pct > 0 ? (
                <div key={i} className={`${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
              ) : null
            })}
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Emergencia',   val: stats.emergencias,  color: 'bg-red-500' },
              { label: 'Urgente',      val: stats.urgentes,     color: 'bg-orange-500' },
              { label: 'Semi-urgente', val: stats.semiUrgentes, color: 'bg-blue-500' },
              { label: 'No urgente',   val: stats.noUrgentes,   color: 'bg-green-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-gray-400">{label}: <span className="text-white">{val}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sala de espera en tiempo real */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <p className="text-sm font-medium text-white">Sala de espera</p>
            {conectado && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                En vivo
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{salaEspera.length} paciente{salaEspera.length !== 1 ? 's' : ''}</span>
        </div>

        {salaEspera.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <Users size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin pacientes en espera</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {salaEspera.map(p => {
              const cfg = NIVEL_CONFIG[p.nivel as keyof typeof NIVEL_CONFIG]
              return (
                <div key={p.triageId} className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot} ${
                      p.nivel === 1 ? 'animate-pulse' : ''
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{p.nombrePaciente}</p>
                      <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{p.minutosEspera} min</p>
                    <p className="text-xs text-gray-500">esperando</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}