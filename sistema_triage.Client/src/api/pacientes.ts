import api from './client'
import type { Paciente, CrearPacienteDto, ApiResponse, ActualizarPacienteDto, PaginatedResponse } from '../types'

export const pacientesApi = {
getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Paciente>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<Paciente>>>(
    `/pacientes?page=${page}&pageSize=${pageSize}`
  )
  return res.data.data
},
  getById: async (id: string): Promise<Paciente> => {
    const res = await api.get<ApiResponse<Paciente>>(`/pacientes/${id}`)
    return res.data.data
  },
buscar: async (termino: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Paciente>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<Paciente>>>(
    `/pacientes?busqueda=${termino}&page=${page}&pageSize=${pageSize}`
  )
  return res.data.data
},
  crear: async (dto: CrearPacienteDto): Promise<Paciente> => {
    const res = await api.post<ApiResponse<Paciente>>('/pacientes', dto)
    return res.data.data
  },
  subirFoto: async (id: string, file: File): Promise<string> => {
    const form = new FormData()
    form.append('foto', file)
    const res = await api.post<ApiResponse<{ url: string }>>(`/pacientes/${id}/foto`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data.url
  },
  actualizar: async (id: string, dto: ActualizarPacienteDto): Promise<Paciente> => {
  const res = await api.put<ApiResponse<Paciente>>(`/pacientes/${id}`, dto)
  return res.data.data
},
getMiPerfil: async (): Promise<Paciente> => {
  const res = await api.get<ApiResponse<Paciente>>('/pacientes/mi-perfil')
  return res.data.data
},
getByDocumento: async (documento: string): Promise<Paciente | null> => {
  try {
    const res = await api.get<ApiResponse<Paciente>>(`/pacientes/documento/${documento}`)
    return res.data.data
  } catch (err: any) {
    if (err?.response?.status === 404) return null
    return null
  }
},
desactivar: async (id: string): Promise<void> => {
  await api.delete(`/pacientes/${id}`)
},
getAllList: async (): Promise<Paciente[]> => {
  const res = await api.get<ApiResponse<PaginatedResponse<Paciente>>>(
    `/pacientes?page=1&pageSize=1000`
  )
  return res.data.data.data
},


}