import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './screens/Login'
import Register from './screens/Register'
import SelectCompany from './screens/SelectCompany'
import Devices from './screens/Devices'
import Sensors from './screens/Sensors'
import Actuators from './screens/Actuators'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { logout } from './services/auth'
import { useState } from 'react'


export default function App() {
  const [authenticated, setAuthenticated]= useState(!!localStorage.getItem('token'))
  const onLogin = (companyId)=>{
    localStorage.setItem('companyId',companyId)
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
        <Route path="/dispositivos" element={<Devices />} />
        <Route path="/sensores" element={<Sensors />} />
        <Route path="/atuadores" element={<Actuators />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
