import { useState, useEffect, useRef } from 'react'
import { Search, Plus, User, X } from 'lucide-react'
import { pacientesApi } from '../../api/pacientes'
import { authApi } from '../../api/auth'
import type { Paciente, CrearPacienteDto } from '../../types'

function validarEmail(email: string) {
  if (!email.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarTelefono(telefono: string) {
  if (!telefono.trim()) return true
  return /^[0-9+\-\s]{7,15}$/.test(telefono)
}

function validarDocumento(doc: string) {
  return /^[0-9A-Za-z\-]{6,20}$/.test(doc)
}

function validarPassword(password: string) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
}

function obtenerEdad(fechaNacimiento: string) {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function ModalCrearCuenta({
  paciente, onClose, onCuentaCreada,
}: {
  paciente: Paciente
  onClose: () => void
  onCuentaCreada: (pacienteId: string) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const emailValido = !!paciente.email && validarEmail(paciente.email)
  const passwordValida = validarPassword(password)
  const passwordsCoinciden = password === confirmar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paciente.email) { setError('El paciente no tiene email registrado.'); return }
    if (!emailValido) { setError('El email del paciente no es válido.'); return }
    if (!passwordValida) { setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.'); return }
    if (!passwordsCoinciden) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    setError('')
    try {
      await authApi.crearCuentaPaciente({
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        email: paciente.email,
        password,
        confirmarPassword: confirmar,
      })
      setExito(true)
      onCuentaCreada(paciente.id)
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? err?.response?.data?.errores?.[0] ?? 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Crear cuenta</h3>
            <p className="text-sm text-gray-400 mt-0.5">{paciente.nombreCompleto}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" type="button"><X size={20} /></button>
        </div>

        <div className="p-6">
          {exito ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <p className="text-white font-medium">Cuenta creada correctamente</p>
              <p className="text-gray-400 text-sm mt-1">El paciente puede ingresar con <span className="text-blue-400">{paciente.email}</span></p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg" type="button">Cerrar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email del paciente</label>
                <input value={paciente.email ?? ''} disabled
                  className={`w-full bg-gray-800/50 border rounded-lg px-3 py-2 text-sm cursor-not-allowed ${
                    paciente.email && !emailValido ? 'border-red-500 text-red-400' : 'border-gray-700 text-gray-400'
                  }`} />
                {!paciente.email && <p className="text-yellow-400 text-xs mt-1">Este paciente no tiene email. Edítalo primero.</p>}
                {paciente.email && !emailValido && <p className="text-red-400 text-xs mt-1">El email registrado no tiene formato válido.</p>}
                {paciente.email && emailValido && <p className="text-green-400 text-xs mt-1">✓ Email válido</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Contraseña *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número, 1 especial"
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                    password && !passwordValida ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
                  }`} />
                {password && !passwordValida && (
                  <p className="text-red-400 text-xs mt-1">Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.</p>
                )}
                {password && passwordValida && <p className="text-green-400 text-xs mt-1">✓ Contraseña segura</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Confirmar contraseña *</label>
                <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                    confirmar && !passwordsCoinciden ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
                  }`} />
                {confirmar && !passwordsCoinciden && <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden.</p>}
                {confirmar && passwordsCoinciden && password && <p className="text-green-400 text-xs mt-1">✓ Las contraseñas coinciden</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg">Cancelar</button>
                <button type="submit" disabled={loading || !paciente.email || !emailValido || !passwordValida || !passwordsCoinciden}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                  {loading ? 'Creando...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalCrearPaciente({
  onClose, onCreado,
}: {
  onClose: () => void
  onCreado: (p: Paciente) => void
}) {
  const [form, setForm] = useState<CrearPacienteDto>({
    nombres: '', apellidos: '', numeroDocumento: '',
    fechaNacimiento: '', genero: 0,
    telefono: '', email: '', direccion: '',
    alergias: '', comorbilidades: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [documentoExiste, setDocumentoExiste] = useState(false)
  const [verificandoDoc, setVerificandoDoc] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (k: keyof CrearPacienteDto, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const nombresValidos = form.nombres.trim().length >= 2
  const apellidosValidos = form.apellidos.trim().length >= 2
  const documentoValido = validarDocumento(form.numeroDocumento.trim())
  const emailValido = validarEmail(form.email ?? '')
  const telefonoValido = validarTelefono(form.telefono ?? '')

  const fechaNacimientoValida = (() => {
    if (!form.fechaNacimiento) return false
    const fecha = new Date(form.fechaNacimiento)
    return fecha <= new Date()
  })()

  const edad = obtenerEdad(form.fechaNacimiento)
  const edadValida = edad != null && edad >= 0 && edad <= 120

  const formularioValido =
    nombresValidos && apellidosValidos && documentoValido &&
    fechaNacimientoValida && edadValida && emailValido &&
    telefonoValido && !documentoExiste

  const verificarDocumento = (doc: string) => {
    setDocumentoExiste(false)
    setVerificandoDoc(false)
    if (!validarDocumento(doc.trim())) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setVerificandoDoc(true)
      try {
        const res = await pacientesApi.getByDocumento(doc.trim())
        setDocumentoExiste(!!res)
      } catch {
        setDocumentoExiste(false)
      } finally {
        setVerificandoDoc(false)
      }
    }, 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombresValidos) { setError('Los nombres deben tener al menos 2 caracteres.'); return }
    if (!apellidosValidos) { setError('Los apellidos deben tener al menos 2 caracteres.'); return }
    if (!documentoValido) { setError('El número de documento debe tener entre 6 y 20 caracteres válidos.'); return }
    if (documentoExiste) { setError('Ya existe un paciente con este documento.'); return }
    if (!fechaNacimientoValida || !edadValida) { setError('La fecha de nacimiento no es válida.'); return }
    if (!emailValido) { setError('El email no tiene formato válido.'); return }
    if (!telefonoValido) { setError('El teléfono debe tener entre 7 y 15 dígitos.'); return }

    setLoading(true)
    try {
      const nuevo = await pacientesApi.crear({
        ...form,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        numeroDocumento: form.numeroDocumento.trim(),
      })
      onCreado(nuevo)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error al crear paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Nuevo paciente</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" type="button"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nombres *</label>
              <input value={form.nombres} onChange={e => set('nombres', e.target.value)} required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                  form.nombres && !nombresValidos ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.nombres && !nombresValidos && <p className="text-xs text-red-400 mt-1">Mínimo 2 caracteres.</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Apellidos *</label>
              <input value={form.apellidos} onChange={e => set('apellidos', e.target.value)} required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                  form.apellidos && !apellidosValidos ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.apellidos && !apellidosValidos && <p className="text-xs text-red-400 mt-1">Mínimo 2 caracteres.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">N° Documento *</label>
              <input value={form.numeroDocumento}
                onChange={e => { set('numeroDocumento', e.target.value); verificarDocumento(e.target.value) }}
                required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors ${
                  (form.numeroDocumento && !documentoValido) || documentoExiste ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.numeroDocumento && !documentoValido && <p className="text-xs text-red-400 mt-1">Entre 6 y 20 caracteres válidos.</p>}
              {verificandoDoc && <p className="text-xs text-gray-400 mt-1">Verificando...</p>}
              {documentoExiste && <p className="text-xs text-red-400 mt-1">Ya existe un paciente con este documento.</p>}
              {form.numeroDocumento && documentoValido && !verificandoDoc && !documentoExiste && (
                <p className="text-xs text-green-400 mt-1">✓ Documento disponible</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Fecha nacimiento *</label>
              <input type="date" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                  form.fechaNacimiento && (!fechaNacimientoValida || !edadValida) ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.fechaNacimiento && (!fechaNacimientoValida || !edadValida) && <p className="text-xs text-red-400 mt-1">Fecha no válida.</p>}
              {edad != null && edadValida && <p className="text-xs text-gray-400 mt-1">Edad: {edad} años</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Género *</label>
            <select value={form.genero} onChange={e => set('genero', parseInt(e.target.value, 10))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value={0}>Masculino</option>
              <option value={1}>Femenino</option>
              <option value={2}>Otro</option>
              <option value={3}>No especificado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
                placeholder="987 654 321"
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                  form.telefono && !telefonoValido ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.telefono && !telefonoValido && <p className="text-xs text-red-400 mt-1">Entre 7 y 15 dígitos.</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="paciente@email.com"
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${
                  form.email && !emailValido ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`} />
              {form.email && !emailValido && <p className="text-xs text-red-400 mt-1">Email no válido.</p>}
              {form.email && emailValido && <p className="text-xs text-green-400 mt-1">✓ Email válido</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Dirección</label>
            <input value={form.direccion} onChange={e => set('direccion', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Alergias</label>
            <input value={form.alergias} onChange={e => set('alergias', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Comorbilidades</label>
            <input value={form.comorbilidades} onChange={e => set('comorbilidades', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading || verificandoDoc || !formularioValido}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Guardando...' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [termino, setTermino] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)

  useEffect(() => {
    pacientesApi.getAll().then(setPacientes).finally(() => setLoading(false))
  }, [])

  const buscar = async () => {
    if (!termino.trim()) {
      const todos = await pacientesApi.getAll()
      setPacientes(todos)
      return
    }
    const res = await pacientesApi.buscar(termino.trim())
    setPacientes(res)
  }

  const onPacienteCreado = (p: Paciente) => setPacientes(prev => [p, ...prev])

  const onCuentaCreada = (pacienteId: string) =>
    setPacientes(prev => prev.map(p => p.id === pacienteId ? { ...p, tieneCuenta: true } : p))

  return (
    <div className="p-8">
      {modalAbierto && (
        <ModalCrearPaciente onClose={() => setModalAbierto(false)} onCreado={onPacienteCreado} />
      )}
      {pacienteSeleccionado && (
        <ModalCrearCuenta
          paciente={pacienteSeleccionado}
          onClose={() => setPacienteSeleccionado(null)}
          onCuentaCreada={onCuentaCreada}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pacientes</h2>
          <p className="text-gray-400 mt-1 text-sm">{pacientes.length} pacientes registrados</p>
        </div>
        <button onClick={() => setModalAbierto(true)} type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} />
          Nuevo paciente
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={termino} onChange={e => setTermino(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar por nombre o documento..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <button onClick={buscar} type="button"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
          Buscar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : pacientes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay pacientes registrados</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Paciente</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Documento</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Edad</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Contacto</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-medium text-blue-400">
                        {p.nombres.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{p.nombreCompleto}</p>
                        <p className="text-xs text-gray-400">{p.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300">{p.numeroDocumento}</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{p.edad} años</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{p.telefono ?? '—'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setPacienteSeleccionado(p)}
                      disabled={!p.email || p.tieneCuenta}
                      title={!p.email ? 'Sin email registrado' : p.tieneCuenta ? 'Ya tiene cuenta activa' : 'Crear cuenta de acceso'}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        !p.email || p.tieneCuenta
                          ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white cursor-pointer'
                      }`}>
                      {p.tieneCuenta ? 'Cuenta activa' : 'Crear cuenta'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}