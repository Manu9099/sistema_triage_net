import api from './client'
import type { LoginDto, TokenResponse, ApiResponse } from '../types'

export const authApi = {
  login: async (dto: LoginDto): Promise<TokenResponse> => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', dto)
    return res.data.data
  },
  logout: async () => {
    await api.post('/auth/revocar')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
  crearCuentaPaciente: async (dto: { nombres: string; apellidos: string; email: string; password: string; confirmarPassword: string }): Promise<TokenResponse> => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/crear-cuenta-paciente', {
        ...dto,
        rol: 'Paciente'
    })
    return res.data.data
  }
}
