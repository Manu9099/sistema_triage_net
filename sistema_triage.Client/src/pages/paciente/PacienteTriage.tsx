import { useState } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { triageApi } from '../../api/triage'
import type { TriageResponse } from '../../types'
import { usePacientePerfil } from '../../hooks/usePacientePerfil'

const SINTOMAS = {
  alarma: [
    { id: 'glasgow',       label: 'Alteración de consciencia' },
    { id: 'disnea_severa', label: 'Dificultad respiratoria severa' },
    { id: 'dolor_pecho',   label: 'Dolor de pecho' },
    { id: 'paralisis',     label: 'Parálisis o hemiplejia' },
    { id: 'convulsion',    label: 'Convulsión activa' },
    { id: 'hemoptisis',    label: 'Vómito con sangre' },
    { id: 'pa_baja',       label: 'Presión muy baja' },
    { id: 'cianosis',      label: 'Labios o piel azulados' },
  ],
  resp: [
    { id: 'tos',      label: 'Tos' },
    { id: 'esputo',   label: 'Flema' },
    { id: 'disnea',   label: 'Falta de aire' },
    { id: 'sibilan',  label: 'Silbido al respirar' },
    { id: 'rinorrea', label: 'Nariz congestionada' },
  ],
  cardio: [
    { id: 'palpitaciones', label: 'Palpitaciones' },
    { id: 'edema',         label: 'Piernas hinchadas' },
    { id: 'mareo',         label: 'Mareo' },
    { id: 'sincope',       label: 'Desmayo' },
  ],
  digest: [
    { id: 'nausea',     label: 'Náuseas' },
    { id: 'vomito',     label: 'Vómito' },
    { id: 'diarrea',    label: 'Diarrea' },
    { id: 'dolor_abd',  label: 'Dolor de barriga' },
    { id: 'ictericia',  label: 'Piel amarilla' },
  ],
  general: [
    { id: 'fiebre',        label: 'Fiebre' },
    { id: 'cefalea',       label: 'Dolor de cabeza' },
    { id: 'astenia',       label: 'Cansancio intenso' },
    { id: 'perdida_peso',  label: 'Pérdida de peso' },
    { id: 'adenopatias',   label: 'Ganglios inflamados' },
  ],
}

const NIVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Emergencia',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  2: { label: 'Urgente',      color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  3: { label: 'Semi-urgente', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  4: { label: 'No urgente',   color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
}

const PASOS = [
  { id: 1, label: 'Urgencia',  desc: 'Signos de alarma' },
  { id: 2, label: 'Síntomas',  desc: 'Por sistema' },
  { id: 3, label: 'Detalles',  desc: 'Información extra' },
  { id: 4, label: 'Confirmar', desc: 'Resumen' },
]

function SintomaBtn({ label, activo, onClick }: { label: string; activo: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm border transition-all ${
        activo
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
      }`}>
      {label}
    </button>
  )
}

export function PacienteTriage() {
  const [paso, setPaso] = useState(1)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [inicio, setInicio] = useState('agudo')
  const [observaciones, setObservaciones] = useState('')
  const [resultado, setResultado] = useState<TriageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { paciente } = usePacientePerfil()

  const toggle = (id: string) =>
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const getSintomas = (grupo: { id: string }[]) =>
    grupo.filter(s => selected[s.id]).map(s => s.id)

  const totalSintomas = [
    ...getSintomas(SINTOMAS.alarma),
    ...getSintomas(SINTOMAS.resp),
    ...getSintomas(SINTOMAS.cardio),
    ...getSintomas(SINTOMAS.digest),
    ...getSintomas(SINTOMAS.general),
  ]

  const siguiente = () => {
    if (paso === 2 && totalSintomas.length === 0) {
      setError('Selecciona al menos un síntoma para continuar')
      return
    }
    setError('')
    setPaso(p => Math.min(p + 1, 4))
  }

  const anterior = () => {
    setError('')
    setPaso(p => Math.max(p - 1, 1))
  }

  const resetFormulario = () => {
    setResultado(null)
    setSelected({})
    setObservaciones('')
    setError('')
    setInicio('agudo')
    setPaso(1)
  }

  const handleSubmit = async () => {
    if (!paciente?.id) { setError('No se encontró tu perfil'); return }
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
        observaciones: observaciones.trim() || undefined,
      })
      setResultado(res)
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al registrar triage')
    } finally {
      setLoading(false)
    }
  }

  // Resultado final
  if (resultado) {
    const nivel = resultado.nivel ?? resultado.nivel
    const cfg = NIVEL_CONFIG[nivel]
    return (
      <div className="max-w-lg">
        <div className={`border-2 rounded-2xl p-6 mb-6 ${cfg.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className={cfg.color} />
            <span className={`font-semibold ${cfg.color}`}>
              Nivel {nivel} — {cfg.label}
            </span>
          </div>
          <p className={`text-sm ${cfg.color} opacity-80`}>{resultado.recomendacionClinica}</p>
          <p className={`text-sm font-medium mt-1 ${cfg.color}`}>⏱ {resultado.tiempoAtencion}</p>
        </div>

        {resultado.diagnosticosDiferenciales?.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-3">Posibles diagnósticos</p>
            <div className="space-y-3">
              {resultado.diagnosticosDiferenciales.map((d, i) => (
                <div key={d.codigo} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm text-gray-800">{d.nombre}</p>
                      <span className="text-xs font-semibold text-blue-600">{d.probabilidad}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${d.probabilidad}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={resetFormulario} type="button"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-colors">
          Nueva evaluación
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Evaluación de síntomas</h2>
        <p className="text-gray-500 text-sm">Hola {paciente?.nombres} — cuéntanos cómo te sientes</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {PASOS.map((p, i) => (
          <div key={p.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                paso > p.id ? 'bg-blue-600 text-white' :
                paso === p.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {paso > p.id ? <CheckCircle size={14} /> : p.id}
              </div>
              <p className={`text-xs mt-1 font-medium ${paso >= p.id ? 'text-gray-800' : 'text-gray-400'}`}>
                {p.label}
              </p>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${paso > p.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Paso 1 — Signos de alarma */}
      {paso === 1 && (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-xs font-medium">⚠ Marca si tienes alguno de estos síntomas graves</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SINTOMAS.alarma.map(s => (
              <SintomaBtn key={s.id} label={s.label} activo={!!selected[s.id]} onClick={() => toggle(s.id)} />
            ))}
          </div>
          {getSintomas(SINTOMAS.alarma).length === 0 && (
            <p className="text-xs text-gray-400 mt-3">Si no tienes ninguno, continúa al siguiente paso</p>
          )}
        </div>
      )}

      {/* Paso 2 — Síntomas por sistema */}
      {paso === 2 && (
        <div className="space-y-5">
          {[
            { label: '🫁 Respiratorios', grupo: SINTOMAS.resp },
            { label: '❤️ Cardiovasculares', grupo: SINTOMAS.cardio },
            { label: '🫃 Digestivos', grupo: SINTOMAS.digest },
            { label: '🧠 Generales', grupo: SINTOMAS.general },
          ].map(({ label, grupo }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {grupo.map(s => (
                  <SintomaBtn key={s.id} label={s.label} activo={!!selected[s.id]} onClick={() => toggle(s.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paso 3 — Detalles */}
      {paso === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">¿Cuándo comenzaron los síntomas?</label>
            <div className="flex gap-2">
              {[
                { v: 'agudo',    label: 'Hoy o ayer' },
                { v: 'subagudo', label: 'Esta semana' },
                { v: 'cronico',  label: 'Hace semanas' },
              ].map(({ v, label }) => (
                <button key={v} type="button" onClick={() => setInicio(v)}
                  className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                    inicio === v
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">¿Algo más que quieras contarnos?</label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3}
              placeholder="Describe cómo te sientes, medicamentos que tomas, etc..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>
      )}

      {/* Paso 4 — Confirmar */}
      {paso === 4 && (
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-medium text-gray-500">Resumen de tu evaluación</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Síntomas seleccionados</span>
              <span className="font-medium text-gray-900">{totalSintomas.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Inicio de síntomas</span>
              <span className="font-medium text-gray-900 capitalize">
                {inicio === 'agudo' ? 'Hoy o ayer' : inicio === 'subagudo' ? 'Esta semana' : 'Hace semanas'}
              </span>
            </div>
            {getSintomas(SINTOMAS.alarma).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-xs font-medium">
                  ⚠ Tienes {getSintomas(SINTOMAS.alarma).length} signo(s) de alarma — serás atendido con prioridad
                </p>
              </div>
            )}
            {observaciones && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                <p className="text-sm text-gray-700">{observaciones}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Al confirmar, un médico revisará tu evaluación y se te asignará un nivel de urgencia
          </p>
        </div>
      )}

      {/* Navegación */}
      <div className="flex gap-3 mt-8">
        {paso > 1 && (
          <button type="button" onClick={anterior}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-2xl transition-colors">
            <ChevronLeft size={16} />
            Anterior
          </button>
        )}
        {paso < 4 ? (
          <button type="button" onClick={siguiente}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-colors ml-auto">
            Siguiente
            <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-2xl transition-colors ml-auto">
            {loading ? 'Enviando...' : 'Confirmar evaluación'}
            {!loading && <CheckCircle size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}