export function toLocalISOString(fecha: string, finDia = false): string {
  const d = new Date(fecha)
  if (finDia) {
    d.setHours(23, 59, 59, 999)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  // Ajustar a UTC manteniendo la hora local
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString()
}

export function hoyLocal(): string {
  return new Date().toLocaleDateString('en-CA') // formato YYYY-MM-DD
}