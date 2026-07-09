import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './screens/Login'
import Register from './screens/Register'
import SelectCompany from './screens/SelectCompany'
import Dashboard from './screens/Dashboard'
import Devices from './screens/Devices'
import Sensors from './screens/Sensors'
import Actuators from './screens/Actuators'
import Leituras from './screens/Leituras'
import NotFound from './screens/NotFound'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { logout } from './services/auth'
import { useState } from 'react'


export default function App() {
  const [authenticated, setAuthenticated]= useState(!!localStorage.getItem('token'))
  const onLogin = (companyId, companyName, roleCompany)=>{
    localStorage.setItem('companyId',companyId)
    if (companyName) localStorage.setItem('companyName', companyName)
    localStorage.setItem('roleCompany', String(roleCompany ?? 0))
    setAuthenticated(true)
  }
  const onLogout = () => {
    logout()
    setAuthenticated(false)
  }
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/empresas" element={<SelectCompany onLogin={onLogin} />} />
      <Route element={
        <ProtectedRoute authenticated={authenticated}>
          <DashboardLayout onLogout={onLogout} />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dispositivos" element={<Devices />} />
        <Route path="/sensores" element={<Sensors />} />
        <Route path="/atuadores" element={<Actuators />} />
        <Route path="/leituras" element={<Leituras />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
