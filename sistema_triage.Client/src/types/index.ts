export interface LoginDto {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiracion: string
  userId: string
  email: string
  nombreCompleto: string
  roles: string[]
}

export interface Paciente {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  numeroDocumento: string
  fechaNacimiento: string
  edad: number
  genero: number
  telefono?: string
  email?: string
  direccion?: string
  fotoUrl?: string
  alergias?: string
  comorbilidades?: string
  fechaRegistro: string
  tieneCuenta?: boolean
}

export interface CrearPacienteDto {
  nombres: string
  apellidos: string
  numeroDocumento: string
  fechaNacimiento: string
  genero: number
  telefono?: string
  email?: string
  direccion?: string
  alergias?: string
  comorbilidades?: string
}

export interface CrearTriageDto {
  pacienteId: string
  inicioSintomas: string
  signosAlarma: string[]
  sintomasResp: string[]
  sintomasCardio: string[]
  sintomasDigest: string[]
  sintomasGeneral: string[]
  observaciones?: string
  temperatura?: number
  frecuenciaCardiaca?: number
  frecuenciaRespiratoria?: number
  saturacionOxigeno?: number
  presionArterial?: string
  glucosa?: number
}

export interface DiagnosticoDiferencial {
  codigo: string
  nombre: string
  grupo: string
  descripcion: string
  probabilidad: number
  sintomasCoincidentes: string[]
  nivelUrgencia: string
  recomendacion: string
}

export interface TriageResponse {
  id: string
  pacienteId: string
  nombrePaciente: string
  numeroDocumento: string
  edad: number
  inicioSintomas: string
  nivel: number
  nivelDescripcion: string
  recomendacionClinica: string
  tiempoAtencion: string
  signosAlarma: string[]
  todosSintomas: string[]
  observaciones?: string
  fechaRegistro: string
  usuarioRegistra: string
  diagnosticosDiferenciales: DiagnosticoDiferencial[]
  temperatura?: number
  frecuenciaCardiaca?: number
  frecuenciaRespiratoria?: number
  saturacionOxigeno?: number
  presionArterial?: string
  glucosa?: number
  alertasVitales: string[]
}

export interface ApiResponse<T> {
  exitoso: boolean
  mensaje: string
  data: T
  errores: string[]
}

export type Rol = 'Admin' | 'Staff' | 'Paciente'

export interface ActualizarPacienteDto {
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: number
  telefono?: string
  email?: string
  direccion?: string
  alergias?: string
  comorbilidades?: string
}