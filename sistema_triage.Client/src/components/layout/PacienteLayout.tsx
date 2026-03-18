import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Home, ClipboardList, Clock, User, LogOut } from 'lucide-react'

export function PacienteLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sistema Triage</h1>
            <p className="text-xs text-gray-500">Portal del paciente</p>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/paciente" end className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Home size={16} />
              Inicio
            </NavLink>
            <NavLink to="/paciente/triage" className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <ClipboardList size={16} />
              Nuevo triage
            </NavLink>
            <NavLink to="/paciente/historial" className={({ isActive }: { isActive: boolean }) =>
      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Clock size={16} />
      Mi historial
    </NavLink>
    <NavLink to="/paciente/perfil" className={({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
    <User size={16} />
    Mi perfil
        </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nombreCompleto}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}