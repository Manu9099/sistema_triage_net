import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { LayoutDashboard, Users, ClipboardList, Clock, Calendar, BarChart2, LogOut } from 'lucide-react'
import { Notificaciones } from '../ui/Notificaciones'


export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
                <h1 className="text-lg font-semibold text-white">Sistema Triage</h1>
                     <p className="text-xs text-gray-400 mt-1">Panel administrativo</p>
                      </div>
                         <Notificaciones />
                        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin" end className={({ isActive }: { isActive: boolean }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/pacientes" className={({ isActive }: { isActive: boolean }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Users size={16} />
            Pacientes
          </NavLink>
          <NavLink to="/admin/triage" className={({ isActive }: { isActive: boolean }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <ClipboardList size={16} />
            Triage
          </NavLink>
            
            <NavLink to="/admin/historial" className={({ isActive }: { isActive: boolean }) =>
  `         flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Clock size={16} />
             Historial
            </NavLink>

            <NavLink to="/admin/reportes" className={({ isActive }: { isActive: boolean }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <BarChart2 size={16} />
            Reportes
          </NavLink>

          <NavLink to="/admin/citas" className={({ isActive }: { isActive: boolean }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
          <Calendar size={16} />
          Citas
        </NavLink>

        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
              {user?.nombreCompleto?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombreCompleto}</p>
              <p className="text-xs text-gray-400 truncate">{user?.roles?.[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}