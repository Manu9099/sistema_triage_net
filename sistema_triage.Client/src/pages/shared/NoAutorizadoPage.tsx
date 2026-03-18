import { useNavigate } from 'react-router-dom'

export function NoAutorizadoPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-800">403</p>
        <h1 className="text-2xl font-semibold text-white mt-4">Sin autorización</h1>
        <p className="text-gray-400 mt-2 text-sm">No tienes permisos para acceder a esta sección.</p>
        <button onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          Volver atrás
        </button>
      </div>
    </div>
  )
}