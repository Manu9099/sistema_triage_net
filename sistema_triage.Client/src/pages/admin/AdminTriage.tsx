import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { pacientesApi } from '../../api/pacientes'
import { triageApi } from '../../api/triage'
import type { Paciente, TriageResponse } from '../../types'
import { exportarTriagePDF } from '../../utils/exportarPDF'

const SINTOMAS = {
  alarma: [
    { id: 'glasgow',      label: 'Alteración de consciencia' },
    { id: 'disnea_severa',label: 'Dificultad respiratoria severa' },
    { id: 'dolor_pecho',  label: 'Dolor de pecho' },
    { id: 'paralisis',    label: 'Parálisis o hemiplejia' },
    { id: 'convulsion',   label: 'Convulsión activa' },
    { id: 'hemoptisis',   label: 'Vómito con sangre' },
    { id: 'pa_baja',      label: 'Presión arterial muy baja' },
    { id: 'cianosis',     label: 'Labios o piel azulados' },
  ],
  resp: [
    { id: 'tos',      label: 'Tos' },
    { id: 'esputo',   label: 'Expectoración' },
    { id: 'disnea',   label: 'Falta de aire' },
    { id: 'sibilan',  label: 'Sibilancias' },
    { id: 'rinorrea', label: 'Congestión nasal' },
  ],
  cardio: [
    { id: 'palpitaciones', label: 'Palpitaciones' },
    { id: 'edema',         label: 'Edema en piernas' },
    { id: 'mareo',         label: 'Mareo' },
    { id: 'sincope',       label: 'Síncope' },
  ],
  digest: [
    { id: 'nausea',     label: 'Náuseas' },
    { id: 'vomito',     label: 'Vómito' },
    { id: 'diarrea',    label: 'Diarrea' },
    { id: 'dolor_abd',  label: 'Dolor abdominal' },
    { id: 'ictericia',  label: 'Ictericia' },
  ],
  general: [
    { id: 'fiebre',        label: 'Fiebre' },
    { id: 'cefalea',       label: 'Cefalea' },
    { id: 'astenia',       label: 'Fatiga intensa' },
    { id: 'perdida_peso',  label: 'Pérdida de peso' },
    { id: 'adenopatias',   label: 'Ganglios inflamados' },
  ],
}

const NIVEL_COLORS: Record<number, string> = {
  1: 'bg-red-500/10 text-red-400 border-red-500/20',
  2: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  3: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  4: 'bg-green-500/10 text-green-400 border-green-500/20',
}

interface SignosVitales {
  temperatura: string
  frecuenciaCardiaca: string
  frecuenciaRespiratoria: string
  saturacionOxigeno: string
  presionArterial: string
  glucosa: string
}

const SIGNOS_INICIALES: SignosVitales = {
  temperatura: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '',
  saturacionOxigeno: '', presionArterial: '', glucosa: '',
}

const PASOS = [
  { id: 1, label: 'Paciente',      desc: 'Selección' },
  { id: 2, label: 'Signos alarma', desc: 'Urgencia' },
  { id: 3, label: 'Síntomas',      desc: 'Por sistema' },
  { id: 4, label: 'Vitales',       desc: 'Mediciones' },
  { id: 5, label: 'Confirmar',     desc: 'Resumen' },
]

function SintomaBtn({ label, activo, onClick }: { label: string; activo: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm border transition-all ${
        activo
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
      }`}>
      {label}
    </button>
  )
}

export function AdminTriage() {
  const [paso, setPaso] = useState(1)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteId, setPacienteId] = useState('')
  const [inicio, setInicio] = useState('agudo')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [observaciones, setObservaciones] = useState('')
  const [signos, setSignos] = useState<SignosVitales>(SIGNOS_INICIALES)
  const [resultado, setResultado] = useState<TriageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    pacientesApi.getAllList().then(setPacientes)
  }, [])

  const toggle = (id: string) =>
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const getSintomas = (grupo: { id: string }[]) =>
    grupo.filter(s => selected[s.id]).map(s => s.id)

  const setSigno = (k: keyof SignosVitales, v: string) =>
    setSignos(prev => ({ ...prev, [k]: v }))

  const totalSintomas = [
    ...getSintomas(SINTOMAS.alarma),
    ...getSintomas(SINTOMAS.resp),
    ...getSintomas(SINTOMAS.cardio),
    ...getSintomas(SINTOMAS.digest),
    ...getSintomas(SINTOMAS.general),
  ]

  const pacienteActual = pacientes.find(p => p.id === pacienteId)

  const resetFormulario = () => {
    setResultado(null)
    setSelected({})
    setObservaciones('')
    setSignos(SIGNOS_INICIALES)
    setError('')
    setInicio('agudo')
    setPacienteId('')
    setPaso(1)
  }

  const siguiente = () => {
    if (paso === 1 && !pacienteId) { setError('Selecciona un paciente'); return }
    if (paso === 3 && totalSintomas.length === 0) { setError('Selecciona al menos un síntoma'); return }
    setError('')
    setPaso(p => Math.min(p + 1, 5))
  }

  const anterior = () => {
    setError('')
    setPaso(p => Math.max(p - 1, 1))
  }

  const handleSubmit = async () => {
    if (!pacienteId) return
    setLoading(true)
    setError('')
    try {
      const res = await triageApi.registrar({
        pacienteId,
        inicioSintomas: inicio,
        signosAlarma: getSintomas(SINTOMAS.alarma),
        sintomasResp: getSintomas(SINTOMAS.resp),
        sintomasCardio: getSintomas(SINTOMAS.cardio),
        sintomasDigest: getSintomas(SINTOMAS.digest),
        sintomasGeneral: getSintomas(SINTOMAS.general),
        observaciones: observaciones.trim() || undefined,
        temperatura: signos.temperatura ? parseFloat(signos.temperatura) : undefined,
        frecuenciaCardiaca: signos.frecuenciaCardiaca ? parseInt(signos.frecuenciaCardiaca) : undefined,
        frecuenciaRespiratoria: signos.frecuenciaRespiratoria ? parseInt(signos.frecuenciaRespiratoria) : undefined,
        saturacionOxigeno: signos.saturacionOxigeno ? parseInt(signos.saturacionOxigeno) : undefined,
        presionArterial: signos.presionArterial.trim() || undefined,
        glucosa: signos.glucosa ? parseFloat(signos.glucosa) : undefined,
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
    return (
      <div className="p-8 max-w-2xl">
        <div className={`border rounded-2xl p-6 mb-6 ${NIVEL_COLORS[resultado.nivel ?? resultado.nivel]}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} />
            <span className="text-sm font-semibold">Nivel {resultado.nivel ?? resultado.nivel} — {resultado.nivelDescripcion}</span>
          </div>
          <p className="text-xs opacity-80">{resultado.recomendacionClinica} · {resultado.tiempoAtencion}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <p className="text-xs text-gray-400 mb-3 font-medium">Diagnósticos diferenciales</p>
          <div className="space-y-3">
            {resultado.diagnosticosDiferenciales?.map((d, i) => (
              <div key={d.codigo} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm text-white">{d.nombre}</p>
                    <span className="text-xs font-semibold text-blue-400">{d.probabilidad}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${d.probabilidad}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{d.grupo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => exportarTriagePDF(resultado)} type="button"
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors">
            Exportar PDF
          </button>
          <button onClick={resetFormulario} type="button"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            Nuevo triage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">Registro de triage</h2>

        {/* Stepper */}
        <div className="flex items-center">
          {PASOS.map((p, i) => (
            <div key={p.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  paso > p.id ? 'bg-blue-600 text-white' :
                  paso === p.id ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {paso > p.id ? <CheckCircle size={14} /> : p.id}
                </div>
                <p className={`text-xs mt-1 font-medium ${paso >= p.id ? 'text-white' : 'text-gray-600'}`}>
                  {p.label}
                </p>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${paso > p.id ? 'bg-blue-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Paso 1 — Paciente */}
      {paso === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Paciente *</label>
            <select value={pacienteId} onChange={e => setPacienteId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="">Seleccionar paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} — {p.numeroDocumento}
                </option>
              ))}
            </select>
          </div>

          {pacienteActual && (
            <div className="bg-gray-800 rounded-xl p-4 text-sm space-y-1">
              <p className="text-white font-medium">{pacienteActual.nombreCompleto}</p>
              <p className="text-gray-400">{pacienteActual.edad} años · {pacienteActual.numeroDocumento}</p>
              {pacienteActual.alergias && <p className="text-yellow-400 text-xs">⚠ Alergias: {pacienteActual.alergias}</p>}
              {pacienteActual.comorbilidades && <p className="text-orange-400 text-xs">Comorbilidades: {pacienteActual.comorbilidades}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Inicio de síntomas</label>
            <div className="flex gap-2">
              {['agudo', 'subagudo', 'cronico'].map(v => (
                <button key={v} type="button" onClick={() => setInicio(v)}
                  className={`flex-1 py-2 rounded-xl text-xs border transition-colors capitalize ${
                    inicio === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
                  }`}>
                  {v === 'agudo' ? 'Agudo (horas)' : v === 'subagudo' ? 'Subagudo (días)' : 'Crónico (semanas)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paso 2 — Signos de alarma */}
      {paso === 2 && (
        <div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-xs font-medium">⚠ Signos de alarma — indican emergencia potencial</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SINTOMAS.alarma.map(s => (
              <SintomaBtn key={s.id} label={s.label} activo={!!selected[s.id]} onClick={() => toggle(s.id)} />
            ))}
          </div>
          {getSintomas(SINTOMAS.alarma).length === 0 && (
            <p className="text-xs text-gray-500 mt-3">Sin signos de alarma — continúa al siguiente paso</p>
          )}
        </div>
      )}

      {/* Paso 3 — Síntomas por sistema */}
      {paso === 3 && (
        <div className="space-y-5">
          {[
            { label: '🫁 Respiratorios', grupo: SINTOMAS.resp },
            { label: '❤️ Cardiovasculares', grupo: SINTOMAS.cardio },
            { label: '🫃 Digestivos', grupo: SINTOMAS.digest },
            { label: '🧠 Generales', grupo: SINTOMAS.general },
          ].map(({ label, grupo }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {grupo.map(s => (
                  <SintomaBtn key={s.id} label={s.label} activo={!!selected[s.id]} onClick={() => toggle(s.id)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Observaciones</label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
              placeholder="Notas adicionales..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* Paso 4 — Signos vitales */}
      {paso === 4 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">Todos los campos son opcionales</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: 'temperatura', label: 'Temperatura (°C)', placeholder: '37.0' },
              { k: 'frecuenciaCardiaca', label: 'Frec. cardíaca (lpm)', placeholder: '80' },
              { k: 'frecuenciaRespiratoria', label: 'Frec. respiratoria (rpm)', placeholder: '16' },
              { k: 'saturacionOxigeno', label: 'Saturación O₂ (%)', placeholder: '98' },
              { k: 'presionArterial', label: 'Presión arterial', placeholder: '120/80' },
              { k: 'glucosa', label: 'Glucosa (mg/dL)', placeholder: '100' },
            ].map(({ k, label, placeholder }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                <input
                  value={signos[k as keyof SignosVitales]}
                  onChange={e => setSigno(k as keyof SignosVitales, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paso 5 — Confirmar */}
      {paso === 5 && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-400 font-medium mb-2">Resumen del triage</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Paciente</span>
              <span className="text-white">{pacienteActual?.nombreCompleto}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Inicio síntomas</span>
              <span className="text-white capitalize">{inicio}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total síntomas</span>
              <span className="text-white">{totalSintomas.length}</span>
            </div>
            {getSintomas(SINTOMAS.alarma).length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mt-2">
                <p className="text-red-400 text-xs">⚠ {getSintomas(SINTOMAS.alarma).length} signo(s) de alarma detectado(s)</p>
              </div>
            )}
            {Object.values(signos).some(v => v) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {signos.temperatura && <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-lg">🌡 {signos.temperatura}°C</span>}
                {signos.frecuenciaCardiaca && <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-lg">❤ {signos.frecuenciaCardiaca} lpm</span>}
                {signos.saturacionOxigeno && <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-lg">O₂ {signos.saturacionOxigeno}%</span>}
                {signos.presionArterial && <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-lg">PA {signos.presionArterial}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex gap-3 mt-8">
        {paso > 1 && (
          <button type="button" onClick={anterior}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors">
            <ChevronLeft size={16} />
            Anterior
          </button>
        )}
        {paso < 5 ? (
          <button type="button" onClick={siguiente}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors ml-auto">
            Siguiente
            <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors ml-auto">
            {loading ? 'Registrando...' : 'Registrar triage'}
            {!loading && <CheckCircle size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}