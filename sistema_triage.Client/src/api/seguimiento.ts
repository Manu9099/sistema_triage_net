import api from './client'
import type { ApiResponse, RegistrarSeguimientoDto, SeguimientoResponse } from '../types'

export const seguimientoApi = {
  registrar: async (dto: RegistrarSeguimientoDto): Promise<SeguimientoResponse> => {
    const res = await api.post<ApiResponse<SeguimientoResponse>>('/seguimiento', dto)
    return res.data.data
  },
  getByTriage: async (triageId: string): Promise<SeguimientoResponse | null> => {
    const res = await api.get<ApiResponse<SeguimientoResponse>>(`/seguimiento/triage/${triageId}`)
    return res.data.data
  },
  getByPaciente: async (pacienteId: string): Promise<SeguimientoResponse[]> => {
    const res = await api.get<ApiResponse<SeguimientoResponse[]>>(`/seguimiento/paciente/${pacienteId}`)
    return res.data.data
  }
}