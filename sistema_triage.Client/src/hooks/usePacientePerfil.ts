import { useState, useEffect } from 'react'
import { pacientesApi } from '../api/pacientes'
import type { Paciente } from '../types'

export function usePacientePerfil() {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    pacientesApi.getMiPerfil()
      .then(setPaciente)
      .catch(() => setError('No se encontró tu perfil'))
      .finally(() => setLoading(false))
  }, [])

  return { paciente, setPaciente, loading, error }
}