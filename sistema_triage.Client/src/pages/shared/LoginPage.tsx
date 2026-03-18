import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const MAX_INTENTOS = 5
const BLOQUEO_SEGUNDOS = 60

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null)
  const [segundosRestantes, setSegundosRestantes] = useState(0)

  useEffect(() => {
    if (!bloqueadoHasta) return
    const interval = setInterval(() => {
      const restantes = Math.ceil((bloqueadoHasta - Date.now()) / 1000)
      if (restantes <= 0) {
        setBloqueadoHasta(null)
        setIntentos(0)
        setError('')
        clearInterval(interval)
      } else {
        setSegundosRestantes(restantes)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [bloqueadoHasta])

  const estaBloqueado = bloqueadoHasta !== null && Date.now() < bloqueadoHasta

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (estaBloqueado) return

    if (!email.trim()) { setError('El email es requerido'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return }
    if (!password) { setError('La contraseña es requerida'); return }

    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const stored = localStorage.getItem('user')
      if (stored) {
        const userData = JSON.parse(stored)
        if (userData.roles?.includes('Admin') || userData.roles?.includes('Staff'))
          navigate('/admin')
        else navigate('/paciente')
      }
      setIntentos(0)
    } catch {
      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)

      if (nuevosIntentos >= MAX_INTENTOS) {
        const hasta = Date.now() + BLOQUEO_SEGUNDOS * 1000
        setBloqueadoHasta(hasta)
        setSegundosRestantes(BLOQUEO_SEGUNDOS)
        setError(`Demasiados intentos fallidos. Espera ${BLOQUEO_SEGUNDOS} segundos.`)
      } else {
        const restantes = MAX_INTENTOS - nuevosIntentos
        setError(`Credenciales inválidas. ${restantes} intento${restantes !== 1 ? 's' : ''} restante${restantes !== 1 ? 's' : ''}.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Sistema Triage</h1>
          <p className="text-gray-400 mt-1 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-5">
          {error && (
            <div className={`border rounded-lg p-3 ${estaBloqueado ? 'bg-red-900/20 border-red-500/40' : 'bg-red-500/10 border-red-500/20'}`}>
              <p className="text-red-400 text-sm">{error}</p>
              {estaBloqueado && (
                <p className="text-red-300 text-xs mt-1">
                  Desbloqueado en {segundosRestantes} segundos...
                </p>
              )}
            </div>
          )}

          {intentos > 0 && !estaBloqueado && (
            <div className="flex gap-1">
              {Array.from({ length: MAX_INTENTOS }).map((_, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i < intentos ? 'bg-red-500' : 'bg-gray-700'}`} />
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={estaBloqueado}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-40 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={estaBloqueado}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-40 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || estaBloqueado}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            {estaBloqueado ? `Bloqueado (${segundosRestantes}s)` : loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Sistema de triage clínico — uso exclusivo del personal autorizado
        </p>
      </div>
    </div>
  )
}