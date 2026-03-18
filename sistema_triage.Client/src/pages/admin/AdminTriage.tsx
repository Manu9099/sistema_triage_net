import { useState, useEffect } from 'react'
import { pacientesApi } from '../../api/pacientes'
import { triageApi } from '../../api/triage'
import type { Paciente, TriageResponse } from '../../types'
import { exportarTriagePDF } from '../../utils/exportarPDF'

const SINTOMAS = {
  alarma: [
    { id: 'glasgow', label: 'Alteración de consciencia' },
    { id: 'disnea_severa', label: 'Dificultad respiratoria severa' },
    { id: 'dolor_pecho', label: 'Dolor de pecho' },
    { id: 'paralisis', label: 'Parálisis o hemiplejia' },
    { id: 'convulsion', label: 'Convulsión activa' },
    { id: 'hemoptisis', label: 'Vómito con sangre' },
    { id: 'pa_baja', label: 'Presión arterial muy baja' },
    { id: 'cianosis', label: 'Labios o piel azulados' },
  ],
  resp: [
    { id: 'tos', label: 'Tos' },
    { id: 'esputo', label: 'Expectoración' },
    { id: 'disnea', label: 'Falta de aire' },
    { id: 'sibilan', label: 'Sibilancias' },
    { id: 'rinorrea', label: 'Congestión nasal' },
  ],
  cardio: [
    { id: 'palpitaciones', label: 'Palpitaciones' },
    { id: 'edema', label: 'Edema en piernas' },
    { id: 'mareo', label: 'Mareo' },
    { id: 'sincope', label: 'Síncope' },
  ],
  digest: [
    { id: 'nausea', label: 'Náuseas' },
    { id: 'vomito', label: 'Vómito' },
    { id: 'diarrea', label: 'Diarrea' },
    { id: 'dolor_abd', label: 'Dolor abdominal' },
    { id: 'ictericia', label: 'Ictericia' },
  ],
  general: [
    { id: 'fiebre', label: 'Fiebre' },
    { id: 'cefalea', label: 'Cefalea' },
    { id: 'astenia', label: 'Fatiga intensa' },
    { id: 'perdida_peso', label: 'Pérdida de peso' },
    { id: 'adenopatias', label: 'Ganglios inflamados' },
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
  temperatura: '',
  frecuenciaCardiaca: '',
  frecuenciaRespiratoria: '',
  saturacionOxigeno: '',
  presionArterial: '',
  glucosa: '',
}

export function AdminTriage() {
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
    pacientesApi.getAll().then(setPacientes)
  }, [])

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getSintomas = (grupo: { id: string }[]) => {
    return grupo.filter(s => selected[s.id]).map(s => s.id)
  }

  const setSigno = (k: keyof SignosVitales, v: string) => {
    setSignos(prev => ({ ...prev, [k]: v }))
  }

  const resetFormulario = () => {
    setResultado(null)
    setSelected({})
    setObservaciones('')
    setSignos(SIGNOS_INICIALES)
    setError('')
    setInicio('agudo')
  }

  const handleSubmit = async () => {
    if (!pacienteId) return

    setError('')

    const signosAlarma = getSintomas(SINTOMAS.alarma)
    const sintomasResp = getSintomas(SINTOMAS.resp)
    const sintomasCardio = getSintomas(SINTOMAS.cardio)
    const sintomasDigest = getSintomas(SINTOMAS.digest)
    const sintomasGeneral = getSintomas(SINTOMAS.general)

    const totalSintomas = [
      ...signosAlarma,
      ...sintomasResp,
      ...sintomasCardio,
      ...sintomasDigest,
      ...sintomasGeneral,
    ]

    if (totalSintomas.length === 0) {
      setError('Debes seleccionar al menos un síntoma para continuar.')
      return
    }

    setLoading(true)

    try {
      const res = await triageApi.registrar({
        pacienteId,
        inicioSintomas: inicio,
        signosAlarma,
        sintomasResp,
        sintomasCardio,
        sintomasDigest,
        sintomasGeneral,
        observaciones: observaciones.trim() || undefined,
        temperatura: signos.temperatura ? parseFloat(signos.temperatura) : undefined,
        frecuenciaCardiaca: signos.frecuenciaCardiaca ? parseInt(signos.frecuenciaCardiaca, 10) : undefined,
        frecuenciaRespiratoria: signos.frecuenciaRespiratoria ? parseInt(signos.frecuenciaRespiratoria, 10) : undefined,
        saturacionOxigeno: signos.saturacionOxigeno ? parseInt(signos.saturacionOxigeno, 10) : undefined,
        presionArterial: signos.presionArterial.trim() || undefined,
        glucosa: signos.glucosa ? parseFloat(signos.glucosa) : undefined,
      })

      setResultado(res)
    } finally {
      setLoading(false)
    }
  }

  const SintomaGrid = ({ items }: { items: { id: string; label: string }[] }) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map(s => (
        <button
          type="button"
          key={s.id}
          onClick={() => toggle(s.id)}
          className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
            selected[s.id]
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )

  const inputSigno = (
    label: string,
    key: keyof SignosVitales,
    placeholder: string,
    unit: string
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={signos[key]}
          onChange={e => setSigno(key, e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <span className="text-xs text-gray-500 min-w-fit">{unit}</span>
      </div>
    </div>
  )

  if (resultado) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => exportarTriagePDF(resultado)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>

          <button
            onClick={resetFormulario}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg"
          >
            Nuevo triage
          </button>
        </div>

        <div className={`border rounded-xl p-5 mb-4 ${NIVEL_COLORS[resultado.nivel] ?? NIVEL_COLORS[4]}`}>
          <p className="text-lg font-semibold">
            Nivel {resultado.nivel} — {resultado.nivelDescripcion}
          </p>
          <p className="text-sm mt-1 opacity-80">{resultado.tiempoAtencion}</p>
          <p className="text-sm mt-2">{resultado.recomendacionClinica}</p>
        </div>

        {resultado.alertasVitales?.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-red-400 mb-2">Alertas de signos vitales</p>
            <ul className="space-y-1">
              {resultado.alertasVitales.map(a => (
                <li key={a} className="text-sm text-red-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(resultado.temperatura != null ||
          resultado.frecuenciaCardiaca != null ||
          resultado.saturacionOxigeno != null ||
          resultado.frecuenciaRespiratoria != null ||
          resultado.presionArterial ||
          resultado.glucosa != null) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
            <p className="text-sm font-medium text-gray-300 mb-3">Signos vitales</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {resultado.temperatura != null && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.temperatura}°C</p>
                  <p className="text-xs text-gray-400 mt-0.5">Temperatura</p>
                </div>
              )}

              {resultado.frecuenciaCardiaca != null && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.frecuenciaCardiaca}</p>
                  <p className="text-xs text-gray-400 mt-0.5">FC (lpm)</p>
                </div>
              )}

              {resultado.saturacionOxigeno != null && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.saturacionOxigeno}%</p>
                  <p className="text-xs text-gray-400 mt-0.5">SpO2</p>
                </div>
              )}

              {resultado.frecuenciaRespiratoria != null && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.frecuenciaRespiratoria}</p>
                  <p className="text-xs text-gray-400 mt-0.5">FR (rpm)</p>
                </div>
              )}

              {resultado.presionArterial && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.presionArterial}</p>
                  <p className="text-xs text-gray-400 mt-0.5">PA (mmHg)</p>
                </div>
              )}

              {resultado.glucosa != null && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-white">{resultado.glucosa}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Glucosa (mg/dL)</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Diagnósticos diferenciales</h3>
          <div className="space-y-3">
            {resultado.diagnosticosDiferenciales.map((d, index) => (
              <div key={`${d.codigo}-${index}`} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">{d.nombre}</p>
                  <span className="text-sm font-semibold text-blue-400">{d.probabilidad}%</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${d.probabilidad}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  {d.grupo} — {d.nivelUrgencia}
                </p>
                <p className="text-xs text-gray-400 mt-1">{d.recomendacion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Registrar triage</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Selecciona paciente, signos vitales y síntomas
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Paciente</label>
          <select
            value={pacienteId}
            onChange={e => setPacienteId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Seleccionar paciente...</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombreCompleto} — {p.numeroDocumento}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Inicio de síntomas</label>
          <div className="flex gap-2">
            {[
              ['agudo', 'Agudo (&lt;24h)'],
              ['subagudo', 'Subagudo (1-7d)'],
              ['cronico', 'Crónico'],
            ].map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => setInicio(v)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  inicio === v
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm font-medium text-gray-300 mb-4">
            Signos vitales <span className="text-gray-500 font-normal">(opcionales)</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            {inputSigno('Temperatura', 'temperatura', '36.5', '°C')}
            {inputSigno('Frec. cardíaca', 'frecuenciaCardiaca', '80', 'lpm')}
            {inputSigno('Frec. respiratoria', 'frecuenciaRespiratoria', '16', 'rpm')}
            {inputSigno('Saturación O2', 'saturacionOxigeno', '98', '%')}
            {inputSigno('Glucosa', 'glucosa', '100', 'mg/dL')}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Presión arterial</label>
              <input
                value={signos.presionArterial}
                onChange={e => setSigno('presionArterial', e.target.value)}
                placeholder="120/80"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-red-400 mb-2">Signos de alarma</p>
          <SintomaGrid items={SINTOMAS.alarma} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Sistema respiratorio</p>
          <SintomaGrid items={SINTOMAS.resp} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Sistema cardiovascular</p>
          <SintomaGrid items={SINTOMAS.cardio} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Sistema digestivo</p>
          <SintomaGrid items={SINTOMAS.digest} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Síntomas generales</p>
          <SintomaGrid items={SINTOMAS.general} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Observaciones clínicas adicionales..."
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!pacienteId || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Procesando...' : 'Registrar triage y obtener diagnóstico'}
        </button>
      </div>
    </div>
  )
}