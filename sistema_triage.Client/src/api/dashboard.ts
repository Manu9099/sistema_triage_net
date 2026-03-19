import api from './client'
import type { ApiResponse, DashboardStats, PacienteEspera } from '../types'

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return res.data.data
  },
  getSalaEspera: async (): Promise<PacienteEspera[]> => {
    const res = await api.get<ApiResponse<PacienteEspera[]>>('/dashboard/sala-espera')
    return res.data.data
  }
}