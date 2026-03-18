import { useState, useEffect } from 'react'
import { Users, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react'
import { pacientesApi } from '../../api/pacientes'
import { triageApi } from '../../api/triage'
import type { Paciente, TriageResponse } from '../../types'

export function AdminDashboard() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [triages, setTriages] = useState<TriageResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date()
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString()

    Promise.all([
      pacientesApi.getAll(),
      triageApi.getReporte(desde, hasta)
    ])
      .then(([p, t]) => { setPacientes(p); setTriages(t) })
      .finally(() => setLoading(false))
  }, [])

  const emergencias = triages.filter(t => t.nivel === 1).length
  const urgentes = triages.filter(t => t.nivel === 2).length
  const noUrgentes = triages.filter(t => t.nivel === 4).length

  const stats = [
    { label: 'Pacientes registrados', value: pacientes.length, icon: Users, color: 'blue' },
    { label: 'Triages hoy', value: triages.length, icon: ClipboardList, color: 'purple' },
    { label: 'Emergencias hoy', value: emergencias + urgentes, icon: AlertTriangle, color: 'red' },
    { label: 'No urgentes hoy', value: noUrgentes, icon: CheckCircle, color: 'green' },
  ]

  const NIVEL_CONFIG: Record<number, { label: string; color: string; dot: string }> = {
    1: { label: 'Emergencia', color: 'text-red-400', dot: 'bg-red-500' },
    2: { label: 'Urgente', color: 'text-orange-400', dot: 'bg-orange-500' },
    3: { label: 'Semi-urgente', color: 'text-blue-400', dot: 'bg-blue-500' },
    4: { label: 'No urgente', color: 'text-green-400', dot: 'bg-green-500' },
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1 text-sm">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${
                  color === 'blue' ? 'bg-blue-500/10' :
                  color === 'purple' ? 'bg-purple-500/10' :
                  color === 'red' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <Icon size={18} className={
                    color === 'blue' ? 'text-blue-400' :
                    color === 'purple' ? 'text-purple-400' :
                    color === 'red' ? 'text-red-400' : 'text-green-400'} />
                </div>
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="text-sm text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Triages recientes */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Triages de hoy</h3>
            {triages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No hay triages registrados hoy</p>
            ) : (
              <div className="space-y-3">
                {triages.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${NIVEL_CONFIG[t.nivel]?.dot ?? 'bg-gray-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{t.nombrePaciente}</p>
                        <p className="text-xs text-gray-400">
                          {t.diagnosticosDiferenciales?.[0]?.nombre ?? 'Sin diagnóstico'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${NIVEL_CONFIG[t.nivel]?.color ?? 'text-gray-400'}`}>
                        {NIVEL_CONFIG[t.nivel]?.label ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(t.fechaRegistro).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/pacientes" className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors">
                <Users size={18} className="text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Gestionar pacientes</p>
                  <p className="text-xs text-gray-400">Registrar o buscar pacientes</p>
                </div>
              </a>
              <a href="/admin/triage" className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors">
                <ClipboardList size={18} className="text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Registrar triage</p>
                  <p className="text-xs text-gray-400">Nuevo registro de síntomas</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}