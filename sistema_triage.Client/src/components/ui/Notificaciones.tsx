import { useState, useCallback } from 'react'
import { useSignalR } from '../../hooks/useSignalR'
import { Bell, X, AlertTriangle } from 'lucide-react'

interface Notificacion {
  id: string
  nombrePaciente: string
  nivel: number
  nivelDescripcion: string
  tiempoAtencion: string
  diagnosticoPrincipal: string
  fechaRegistro: string
  esEmergencia: boolean
  leida: boolean
}

const NIVEL_CONFIG: Record<number, { color: string; bg: string; border: string }> = {
  1: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
  2: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  3: { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  4: { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
}

export function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [abierto, setAbierto] = useState(false)
  const [emergenciaActiva, setEmergenciaActiva] = useState<Notificacion | null>(null)

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const onNuevoTriage = useCallback((data: any) => {
    const nueva: Notificacion = {
      ...data,
      id: data.id ?? crypto.randomUUID(),
      esEmergencia: false,
      leida: false
    }
    setNotificaciones(prev => [nueva, ...prev].slice(0, 50))
  }, [])

  const onEmergencia = useCallback((data: any) => {
    const nueva: Notificacion = {
      ...data,
      id: data.id ?? crypto.randomUUID(),
      esEmergencia: true,
      leida: false
    }
    setNotificaciones(prev => [nueva, ...prev].slice(0, 50))
    setEmergenciaActiva(nueva)

    // Auto cerrar alerta de emergencia después de 8 segundos
    setTimeout(() => setEmergenciaActiva(null), 8000)
  }, [])

  useSignalR(onNuevoTriage, onEmergencia)

  const marcarTodasLeidas = () =>
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))

  const eliminar = (id: string) =>
    setNotificaciones(prev => prev.filter(n => n.id !== id))

  return (
    <>
      {/* Alerta emergencia flotante */}
      {emergenciaActiva && (
        <div style={{position:'fixed',top:'1rem',right:'1rem',zIndex:100}}
          className="bg-red-600 border border-red-500 rounded-xl p-4 shadow-2xl max-w-sm animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">¡EMERGENCIA DETECTADA!</p>
              <p className="text-red-100 text-sm mt-0.5">{emergenciaActiva.nombrePaciente}</p>
              <p className="text-red-200 text-xs mt-1">
                Nivel {emergenciaActiva.nivel} — {emergenciaActiva.nivelDescripcion}
              </p>
              {emergenciaActiva.diagnosticoPrincipal !== '—' && (
                <p className="text-red-200 text-xs">{emergenciaActiva.diagnosticoPrincipal}</p>
              )}
            </div>
            <button onClick={() => setEmergenciaActiva(null)}
              className="text-red-200 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Botón campana */}
      <div style={{position:'relative',display:'inline-block'}}>
        <button onClick={() => { setAbierto(!abierto); if (!abierto) marcarTodasLeidas() }}
          className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Bell size={18} />
          {noLeidas > 0 && (
          <span
            style={{position:'absolute',top:4,right:4,fontSize:'9px',fontWeight:'bold'}}
                className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
            </span>
          )}
        </button>

        {/* Panel notificaciones */}
        {abierto && (
          <>
            <div style={{position:'fixed',inset:0,zIndex:40}} onClick={() => setAbierto(false)} />
            <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',zIndex:50,width:'360px'}}>
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-medium text-white">Notificaciones</p>
                  <div className="flex items-center gap-2">
                    {notificaciones.length > 0 && (
                      <button onClick={() => setNotificaciones([])}
                        className="text-xs text-gray-500 hover:text-gray-300">
                        Limpiar
                      </button>
                    )}
                    <button onClick={() => setAbierto(false)}
                      className="text-gray-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div style={{maxHeight:'400px',overflowY:'auto'}}>
                  {notificaciones.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell size={24} className="mx-auto text-gray-700 mb-2" />
                      <p className="text-gray-500 text-sm">Sin notificaciones</p>
                    </div>
                  ) : (
                    notificaciones.map(n => {
                      const cfg = NIVEL_CONFIG[n.nivel] ?? NIVEL_CONFIG[4]
                      return (
                        <div key={n.id}
                          className={`px-4 py-3 border-b border-gray-800/50 ${n.esEmergencia ? 'bg-red-500/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                              n.nivel === 1 ? 'bg-red-500' :
                              n.nivel === 2 ? 'bg-orange-500' :
                              n.nivel === 3 ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-white truncate">
                                  {n.nombrePaciente}
                                </p>
                                <button onClick={() => eliminar(n.id)}
                                  className="text-gray-600 hover:text-gray-400 flex-shrink-0">
                                  <X size={12} />
                                </button>
                              </div>
                              <p className={`text-xs font-medium ${cfg.color}`}>
                                {n.esEmergencia && '⚠ '} Nivel {n.nivel} — {n.nivelDescripcion}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {n.diagnosticoPrincipal !== '—' ? n.diagnosticoPrincipal : n.tiempoAtencion}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {new Date(n.fechaRegistro).toLocaleTimeString('es-PE', {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}