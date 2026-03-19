import api from './client'
import type { ApiResponse, SlotDisponibilidad, Cita, SolicitarCitaDto, CrearSlotDto, GestionarCitaDto } from '../types'

export const citasApi = {
  getSlotsDisponibles: async (desde: string, hasta: string): Promise<SlotDisponibilidad[]> => {
    const res = await api.get<ApiResponse<SlotDisponibilidad[]>>(`/citas/slots?desde=${desde}&hasta=${hasta}`)
    return res.data.data
  },
  crearSlots: async (dto: CrearSlotDto): Promise<SlotDisponibilidad[]> => {
    const res = await api.post<ApiResponse<SlotDisponibilidad[]>>('/citas/slots', dto)
    return res.data.data
  },
  eliminarSlot: async (id: string): Promise<void> => {
    await api.delete(`/citas/slots/${id}`)
  },
  solicitarCita: async (dto: SolicitarCitaDto): Promise<Cita> => {
    const res = await api.post<ApiResponse<Cita>>('/citas/solicitar', dto)
    return res.data.data
  },
  gestionarCita: async (id: string, dto: GestionarCitaDto): Promise<Cita> => {
    const res = await api.put<ApiResponse<Cita>>(`/citas/${id}/gestionar`, dto)
    return res.data.data
  },
  getPendientes: async (): Promise<Cita[]> => {
    const res = await api.get<ApiResponse<Cita[]>>('/citas/pendientes')
    return res.data.data
  },
  getReporte: async (desde: string, hasta: string): Promise<Cita[]> => {
    const res = await api.get<ApiResponse<Cita[]>>(`/citas/reporte?desde=${desde}&hasta=${hasta}`)
    return res.data.data
  },
  getMisCitas: async (): Promise<Cita[]> => {
    const res = await api.get<ApiResponse<Cita[]>>('/citas/mis-citas')
    return res.data.data
  }
}