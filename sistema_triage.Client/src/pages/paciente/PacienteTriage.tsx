import { useState } from 'react'
import { triageApi } from '../../api/triage'
import type { TriageResponse } from '../../types'
import { usePacientePerfil } from '../../hooks/usePacientePerfil'

const SINTOMAS = {
  alarma: [
    { id: 'glasgow', label: 'Alteración de consciencia' },
    { id: 'disnea_severa', label: 'Dificultad respiratoria severa' },
    { id: 'dolor_pecho', label: 'Dolor de pecho' },
    { id: 'paralisis', label: 'Parálisis o hemiplejia' },
    { id: 'convulsion', label: 'Convulsión activa' },
    { id: 'hemoptisis', label: 'Vómito con sangre' },
    { id: 'pa_baja', label: 'Presión muy baja' },
    { id: 'cianosis', label: 'Labios o piel azulados' },
  ],
  resp: [
    { id: 'tos', label: 'Tos' }, { id: 'esputo', label: 'Flema' },
    { id: 'disnea', label: 'Falta de aire' }, { id: 'sibilan', label: 'Silbido al respirar' },
    { id: 'rinorrea', label: 'Nariz congestionada' },
  ],
  cardio: [
    { id: 'palpitaciones', label: 'Palpitaciones' }, { id: 'edema', label: 'Piernas hinchadas' },
    { id: 'mareo', label: 'Mareo' }, { id: 'sincope', label: 'Desmayo' },
  ],
  digest: [
    { id: 'nausea', label: 'Náuseas' }, { id: 'vomito', label: 'Vómito' },
    { id: 'diarrea', label: 'Diarrea' }, { id: 'dolor_abd', label: 'Dolor de barriga' },
    { id: 'ictericia', label: 'Piel amarilla' },
  ],
  general: [
    { id: 'fiebre', label: 'Fiebre' }, { id: 'cefalea', label: 'Dolor de cabeza' },
    { id: 'astenia', label: 'Cansancio intenso' }, { id: 'perdida_peso', label: 'Pérdida de peso' },
    { id: 'adenopatias', label: 'Ganglios inflamados' },
  ],
}

const NIVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Emergencia', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  2: { label: 'Urgente', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  3: { label: 'Semi-urgente', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  4: { label: 'No urgente', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
}

export function PacienteTriage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [inicio, setInicio] = useState('agudo')
  const [resultado, setResultado] = useState<TriageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { paciente } = usePacientePerfil()

  const toggle = (id: string) =>
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const getSintomas = (grupo: { id: string }[]) =>
    grupo.filter(s => selected[s.id]).map(s => s.id)

  const handleSubmit = async () => {
  if (!paciente?.id) {
    const totalSintomas = [
  ...getSintomas(SINTOMAS.alarma),
  ...getSintomas(SINTOMAS.resp),
  ...getSintomas(SINTOMAS.cardio),
  ...getSintomas(SINTOMAS.digest),
  ...getSintomas(SINTOMAS.general),
]

if (totalSintomas.length === 0) {
  setError('Debes seleccionar al menos un síntoma para continuar.')
  return
}
    setError('No se encontró tu perfil. Contacta al personal médico.')
    return
  }
  setLoading(true)
  setError('')
  try {
    const res = await triageApi.registrar({
      pacienteId: paciente.id,
      inicioSintomas: inicio,
      signosAlarma: getSintomas(SINTOMAS.alarma),
      sintomasResp: getSintomas(SINTOMAS.resp),
      sintomasCardio: getSintomas(SINTOMAS.cardio),
      sintomasDigest: getSintomas(SINTOMAS.digest),
      sintomasGeneral: getSintomas(SINTOMAS.general),
    })
    setResultado(res)
  } catch {
    setError('No se pudo procesar el triage. Intenta de nuevo.')
  } finally {
    setLoading(false)
  }
}

  const SintomaGrid = ({ items }: { items: { id: string; label: string }[] }) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map(s => (
        <button key={s.id} onClick={() => toggle(s.id)}
          className={`text-left px-3 py-2 rounded-xl text-sm border transition-colors ${
            selected[s.id]
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          {s.label}
        </button>
      ))}
    </div>
  )

  if (resultado) {
    const cfg = NIVEL_CONFIG[resultado.nivel]
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tu evaluación</h2>

        <div className={`border rounded-2xl p-5 mb-5 ${cfg.bg}`}>
          <p className={`text-lg font-semibold ${cfg.color}`}>
            Nivel {resultado.nivel} — {cfg.label}
          </p>
          <p className={`text-sm mt-1 ${cfg.color} opacity-80`}>{resultado.tiempoAtencion}</p>
          <p className={`text-sm mt-2 ${cfg.color}`}>{resultado.recomendacionClinica}</p>
        </div>

        {resultado.diagnosticosDiferenciales.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Posibles condiciones</h3>
            <div className="space-y-3">
              {resultado.diagnosticosDiferenciales.map(d => (
                <div key={d.codigo} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900">{d.nombre}</p>
                    <span className="text-sm font-semibold text-blue-600">{d.probabilidad}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${d.probabilidad}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{d.recomendacion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mb-4">
          Esta evaluación es orientativa. Consulta siempre con un profesional de salud.
        </p>

        <button onClick={() => { setResultado(null); setSelected({}) }}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
          Nueva evaluación
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Evaluar síntomas</h2>
        <p className="text-gray-500 text-sm mt-1">Selecciona los síntomas que presentas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">¿Cuándo empezaron los síntomas?</p>
          <div className="flex gap-2">
            {[['agudo', 'Hoy / Ayer'], ['subagudo', 'Esta semana'], ['cronico', 'Hace semanas']].map(([v, l]) => (
              <button key={v} onClick={() => setInicio(v)}
                className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${inicio === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-red-600 mb-2">⚠ Síntomas urgentes</p>
          <SintomaGrid items={SINTOMAS.alarma} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Respiratorios</p>
          <SintomaGrid items={SINTOMAS.resp} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Corazón y circulación</p>
          <SintomaGrid items={SINTOMAS.cardio} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Digestivos</p>
          <SintomaGrid items={SINTOMAS.digest} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Generales</p>
          <SintomaGrid items={SINTOMAS.general} />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors">
          {loading ? 'Evaluando...' : 'Obtener evaluación'}
        </button>
      </div>
    </div>
  )
}