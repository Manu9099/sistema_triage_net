import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Clock, User } from 'lucide-react'
import { triageApi } from '../../api/triage'
import type { TriageResponse } from '../../types'

const NIVEL_CONFIG: Record<number, { label: string; color: string; bg: string; border: string; indicador: string; accion: string }> = {
  1: {
    label: 'Emergencia',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    indicador: '🚨 Dirígete a urgencias AHORA',
    accion: 'Llama al 116 o ve a la sala de emergencias inmediatamente'
  },
  2: {
    label: 'Urgente',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    indicador: '⚠️ Atención prioritaria',
    accion: 'Debes ser atendido en menos de 15 minutos. Informa al personal.'
  },
  3: {
    label: 'Semi-urgente',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    indicador: '📋 Espera tu turno',
    accion: 'Serás atendido en los próximos 30-60 minutos. Permanece en sala.'
  },
  4: {
    label: 'No urgente',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    indicador: '✅ Puedes esperar',
    accion: 'Tu consulta no es urgente. Puedes programar una cita médica.'
  },
}

export function PacienteDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ultimoTriage, setUltimoTriage] = useState<TriageResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return }
    triageApi.getByPaciente(user.userId)
      .then(triages => {
        if (triages.length > 0) setUltimoTriage(triages[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const cfg = ultimoTriage ? NIVEL_CONFIG[ultimoTriage.nivel] : null
  const horasTriage = ultimoTriage
    ? Math.floor((Date.now() - new Date(ultimoTriage.fechaRegistro).getTime()) / 3600000)
    : null

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Bienvenido, {user?.nombreCompleto?.split(' ')[0]}
        </h2>
        <p className="text-gray-500 mt-1 text-sm">Portal de salud del paciente</p>
      </div>

      {/* Indicador visual último triage */}
      {!loading && ultimoTriage && cfg && horasTriage !== null && horasTriage < 24 && (
        <div className={`border-2 rounded-2xl p-5 mb-6 ${cfg.bg} ${cfg.border}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-lg font-semibold ${cfg.color}`}>{cfg.indicador}</p>
              <p className={`text-sm mt-1 ${cfg.color} opacity-80`}>{cfg.accion}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              Nivel {ultimoTriage.nivel}
            </span>
          </div>
          <div className={`border-t ${cfg.border} pt-3 mt-2`}>
            <p className={`text-xs ${cfg.color} opacity-70`}>
              Evaluación de hace {horasTriage === 0 ? 'menos de 1 hora' : `${horasTriage} hora${horasTriage > 1 ? 's' : ''}`}
              {ultimoTriage.diagnosticosDiferenciales?.[0] && ` · Posible: ${ultimoTriage.diagnosticosDiferenciales[0].nombre}`}
            </p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => navigate('/paciente/triage')}
          className="flex items-center gap-3 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors text-left">
          <ClipboardList size={22} />
          <div>
            <p className="font-semibold">Nueva evaluación</p>
            <p className="text-blue-200 text-xs mt-0.5">Registrar síntomas ahora</p>
          </div>
        </button>
        <button onClick={() => navigate('/paciente/historial')}
          className="flex items-center gap-3 p-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl transition-colors text-left">
          <Clock size={22} className="text-gray-400" />
          <div>
            <p className="font-semibold">Mi historial</p>
            <p className="text-gray-400 text-xs mt-0.5">Ver evaluaciones anteriores</p>
          </div>
        </button>
      </div>

      {/* Perfil rápido */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.nombreCompleto}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => navigate('/paciente/perfil')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Editar perfil
          </button>
        </div>
      </div>
    </div>
  )
}