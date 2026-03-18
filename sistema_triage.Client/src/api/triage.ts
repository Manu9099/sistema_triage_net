import api from './client'
import type { CrearTriageDto, TriageResponse, ApiResponse } from '../types'

export const triageApi = {
  registrar: async (dto: CrearTriageDto): Promise<TriageResponse> => {
    const res = await api.post<ApiResponse<TriageResponse>>('/triage', dto)
    return res.data.data
  },
  getById: async (id: string): Promise<TriageResponse> => {
    const res = await api.get<ApiResponse<TriageResponse>>(`/triage/${id}`)
    return res.data.data
  },
  getByPaciente: async (pacienteId: string): Promise<TriageResponse[]> => {
    const res = await api.get<ApiResponse<TriageResponse[]>>(`/triage/paciente/${pacienteId}`)
    return res.data.data
  },
  getReporte: async (desde: string, hasta: string): Promise<TriageResponse[]> => {
    const res = await api.get<ApiResponse<TriageResponse[]>>(`/triage/reporte?desde=${desde}&hasta=${hasta}`)
    return res.data.data
  }
}