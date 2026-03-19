import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'

// Páginas compartidas
import { LoginPage } from './pages/shared/LoginPage'
import { NotFoundPage } from './pages/shared/NotFoundPage'
import { NoAutorizadoPage } from './pages/shared/NoAutorizadoPage'

// Portal Admin
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminPacientes } from './pages/admin/AdminPacientes'
import { AdminTriage } from './pages/admin/AdminTriage'
import { AdminHistorial } from './pages/admin/AdminHistorial'
import { AdminReportes } from './pages/admin/AdminReportes'

// Portal Paciente
import { PacienteLayout } from './components/layout/PacienteLayout'
import { PacienteDashboard } from './pages/paciente/PacienteDashboard'
import { PacienteTriage } from './pages/paciente/PacienteTriage'
import { PacienteHistorial } from './pages/paciente/PacienteHistorial'
import { PacientePerfil } from './pages/paciente/PacientePerfil'

//portal Citas
import { AdminCitas } from './pages/admin/AdminCitas'
import { PacienteCitas } from './pages/paciente/PacienteCitas'

function RootRedirect() {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasRole('Admin') || hasRole('Staff')) return <Navigate to="/admin" replace />
  return <Navigate to="/paciente" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

      {/* Portal Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['Admin', 'Staff']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="pacientes" element={<AdminPacientes />} />
        <Route path="triage" element={<AdminTriage />} />
        <Route path="historial" element={<AdminHistorial />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="citas" element={<AdminCitas />} />
      </Route>

      {/* Portal Paciente */}
      <Route path="/paciente" element={
        <ProtectedRoute roles={['Paciente']}>
        
          <PacienteLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PacienteDashboard />} />
        <Route path="triage" element={<PacienteTriage />} />
        <Route path="historial" element={<PacienteHistorial />} />
        <Route path="perfil" element={<PacientePerfil />} />
          <Route path="citas" element={<PacienteCitas />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}