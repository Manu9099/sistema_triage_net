import api from './client'
import type { CrearTriageDto, TriageResponse, ApiResponse, PaginatedResponse } from '../types'

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
  },
getReportePaginado: async (desde: string, hasta: string, page = 1, pageSize = 10): Promise<PaginatedResponse<TriageResponse>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<TriageResponse>>>(
    `/triage/reporte?desde=${desde}&hasta=${hasta}&page=${page}&pageSize=${pageSize}`
  )
  return res.data.data
},

getByPacientePaginado: async (pacienteId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<TriageResponse>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<TriageResponse>>>(
    `/triage/paciente/${pacienteId}?page=${page}&pageSize=${pageSize}`
  )
  return res.data.data
},
getStatsRango: async (desde: string, hasta: string) => {
  const res = await api.get(`/triage/stats-rango?desde=${desde}&hasta=${hasta}`)
  return res.data.data
},

}