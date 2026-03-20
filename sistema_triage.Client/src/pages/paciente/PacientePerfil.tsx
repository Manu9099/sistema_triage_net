import { useState, useEffect, useRef } from 'react'
import { pacientesApi } from '../../api/pacientes'
import { Camera, User } from 'lucide-react'
import { usePacientePerfil } from '../../hooks/usePacientePerfil'

function validarTelefono(telefono: string) {
  if (!telefono.trim()) return true
  return /^[0-9+\-\s]{7,15}$/.test(telefono)
}

function validarTextoLibre(value: string, max = 200) {
  return value.trim().length <= max
}

export function PacientePerfil() {
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    telefono: '',
    direccion: '',
    alergias: '',
    comorbilidades: '',
  })

  const { paciente, setPaciente, loading } = usePacientePerfil()

  useEffect(() => {
    if (!paciente) return
    setForm({
      telefono: paciente.telefono ?? '',
      direccion: paciente.direccion ?? '',
      alergias: paciente.alergias ?? '',
      comorbilidades: paciente.comorbilidades ?? '',
    })
  }, [paciente])

  const telefonoValido = validarTelefono(form.telefono)
  const direccionValida = validarTextoLibre(form.direccion, 150)
  const alergiasValidas = validarTextoLibre(form.alergias, 200)
  const comorbilidadesValidas = validarTextoLibre(form.comorbilidades, 200)

  const formularioValido =
    telefonoValido &&
    direccionValida &&
    alergiasValidas &&
    comorbilidadesValidas

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !paciente) return

    const extensiones = ['image/jpeg', 'image/png', 'image/webp']
    if (!extensiones.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.')
      return
    }

    setSubiendoFoto(true)
    setError('')

    try {
      const url = await pacientesApi.subirFoto(paciente.id, file)
      setPaciente(prev => (prev ? { ...prev, fotoUrl: url } : prev))
    } catch {
      setError('Error al subir la foto.')
    } finally {
      setSubiendoFoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paciente) return

    setError('')
    setExito(false)

    if (!telefonoValido) {
      setError('El teléfono no tiene un formato válido.')
      return
    }

    if (!direccionValida) {
      setError('La dirección no puede superar los 150 caracteres.')
      return
    }

    if (!alergiasValidas) {
      setError('El campo de alergias no puede superar los 200 caracteres.')
      return
    }

    if (!comorbilidadesValidas) {
      setError('El campo de enfermedades crónicas no puede superar los 200 caracteres.')
      return
    }

    setGuardando(true)

    try {
      const actualizado = await pacientesApi.actualizarMiPerfil( {
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        fechaNacimiento: paciente.fechaNacimiento,
        genero: paciente.genero,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        alergias: form.alergias.trim(),
        comorbilidades: form.comorbilidades.trim(),
      })

      setPaciente(actualizado)
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      setError('Error al guardar los cambios.')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No se encontró tu perfil de paciente.</p>
        <p className="text-xs mt-1">Contacta al personal médico para registrarte.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Mi perfil</h2>
        <p className="text-gray-500 mt-1 text-sm">Actualiza tu información personal</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            {paciente.fotoUrl ? (
              <img
                src={paciente.fotoUrl}
                alt="Foto"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                <User size={28} className="text-blue-400" />
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendoFoto}
              type="button"
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
            >
              <Camera size={14} className="text-white" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFoto}
            />
          </div>

          <div>
            <p className="font-semibold text-gray-900">{paciente.nombreCompleto}</p>
            <p className="text-sm text-gray-400">{paciente.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {paciente.edad} años · DNI {paciente.numeroDocumento}
            </p>
            {subiendoFoto && <p className="text-xs text-blue-500 mt-1">Subiendo foto...</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-green-600 text-sm">Perfil actualizado correctamente.</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Teléfono</label>
          <input
            value={form.telefono}
            onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
            placeholder="987 654 321"
            className={`w-full border rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none ${
              form.telefono && !telefonoValido
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          {form.telefono && !telefonoValido && (
            <p className="text-xs text-red-500 mt-1">
              Ingresa un teléfono válido de 7 a 15 caracteres.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Dirección</label>
          <input
            value={form.direccion}
            onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
            placeholder="Av. ejemplo 123"
            className={`w-full border rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none ${
              form.direccion && !direccionValida
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          <div className="flex justify-between mt-1">
            {form.direccion && !direccionValida ? (
              <p className="text-xs text-red-500">La dirección no puede superar 150 caracteres.</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400">{form.direccion.length}/150</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Alergias conocidas</label>
          <input
            value={form.alergias}
            onChange={e => setForm(p => ({ ...p, alergias: e.target.value }))}
            placeholder="Penicilina, aspirina..."
            className={`w-full border rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none ${
              form.alergias && !alergiasValidas
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          <div className="flex justify-between mt-1">
            {form.alergias && !alergiasValidas ? (
              <p className="text-xs text-red-500">No puede superar 200 caracteres.</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400">{form.alergias.length}/200</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Enfermedades crónicas</label>
          <input
            value={form.comorbilidades}
            onChange={e => setForm(p => ({ ...p, comorbilidades: e.target.value }))}
            placeholder="Diabetes, hipertensión..."
            className={`w-full border rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none ${
              form.comorbilidades && !comorbilidadesValidas
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          <div className="flex justify-between mt-1">
            {form.comorbilidades && !comorbilidadesValidas ? (
              <p className="text-xs text-red-500">No puede superar 200 caracteres.</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400">{form.comorbilidades.length}/200</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando || !formularioValido}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}