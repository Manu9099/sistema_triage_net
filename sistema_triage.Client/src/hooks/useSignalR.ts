import { useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

export function useSignalR(onNuevoTriage: (data: any) => void, onEmergencia: (data: any) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  const conectar = useCallback(async () => {
    if (connectionRef.current) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

  const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${import.meta.env.VITE_API_URL}/hubs/triage`, {
    accessTokenFactory: () => token
  })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('NuevoTriage', onNuevoTriage)
    connection.on('NuevaEmergencia', onEmergencia)

    try {
      await connection.start()
      await connection.invoke('UnirseGrupoAdmin')
      connectionRef.current = connection
    } catch (err) {
      console.warn('SignalR no disponible:', err)
    }
  }, [onNuevoTriage, onEmergencia])

  useEffect(() => {
    conectar()
    return () => {
      connectionRef.current?.stop()
      connectionRef.current = null
    }
  }, [conectar])
}