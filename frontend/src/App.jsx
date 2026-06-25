import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './screens/Login'
import Register from './screens/Register'
import SelectCompany from './screens/SelectCompany'
import Devices from './screens/Devices'
import Sensors from './screens/Sensors'
import DashboardLayout from './layouts/DashboardLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/empresas" element={<SelectCompany />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dispositivos" element={<Devices />} />
        <Route path="/sensores" element={<Sensors />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
