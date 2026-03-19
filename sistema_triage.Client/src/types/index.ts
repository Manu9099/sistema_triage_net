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
export interface SlotDisponibilidad {
  id: string
  fechaHoraInicio: string
  fechaHoraFin: string
  disponible: boolean
  nombreStaff: string
  fecha: string
  hora: string
}

export interface SolicitarCitaDto {
  slotId: string
  motivoConsulta?: string
}

export interface CrearSlotDto {
  fechaHoraInicio: string
  duracionMinutos: number
  cantidadSlots: number
}

export interface GestionarCitaDto {
  accion: string
  notasStaff?: string
  motivoRechazo?: string
  nuevoSlotId?: string
}

export interface Cita {
  id: string
  pacienteId: string
  nombrePaciente: string
  numeroDocumento: string
  emailPaciente?: string
  telefonoPaciente?: string
  fechaHoraInicio: string
  fechaHoraFin: string
  fecha: string
  hora: string
  motivoConsulta?: string
  estado: number
  estadoDescripcion: string
  notasStaff?: string
  motivoRechazo?: string
  nombreStaff: string
  fechaSolicitud: string
  fechaConfirmacion?: string
}
export interface PaginatedResponse<T> {
  data: T[]
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}
export interface RegistrarSeguimientoDto {
  triageId: string
  fueAtendido: boolean
  diagnosticoConfirmado?: string
  nivelTriageCorrecto: boolean
  nivelTriageReal?: number
  observaciones?: string
  medicamentosIndicados?: string
}

export interface SeguimientoResponse {
  id: string
  triageId: string
  nombrePaciente: string
  fueAtendido: boolean
  diagnosticoConfirmado?: string
  nivelTriageCorrecto: boolean
  nivelTriageReal?: number
  observaciones?: string
  medicamentosIndicados?: string
  registradoPor: string
  fechaRegistro: string
  nivelTriageOriginal: number
  fechaTriage: string
}