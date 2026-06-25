import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Cpu, Activity, BarChart3, Search, Settings } from 'lucide-react'
import logoImg from '../assets/acucardoce_logo_png_transparente_para_fondo_azul_600.png'

const navItems = [
  { icon: LayoutDashboard, to: '/dashboard', label: 'Dashboard' },
  { icon: Cpu, to: '/dispositivos', label: 'Dispositivos' },
  { icon: Activity, to: '/sensores', label: 'Sensores' },
  { icon: BarChart3, to: '/relatorios', label: 'Relatorios' },
]

const bottomItems = [
  { icon: Search, to: '/buscar', label: 'Buscar' },
  { icon: Settings, to: '/configuracoes', label: 'Configuracoes' },
]

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center justify-center w-10 h-10 rounded-lg transition ${
          isActive
            ? 'bg-gold-500/20 text-white'
            : 'text-gray-400 hover:text-white hover:bg-navy-700'
        }`
      }
      title={item.label}
    >
      <item.icon size={20} />
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-16 bg-navy-900 flex flex-col items-center py-4 justify-between shrink-0">
      <div className="space-y-2">
        <div className="flex items-center justify-center w-10 h-10 mb-4">
          <img src={logoImg} alt="AcucarDoce" className="w-10 h-10 object-contain" />
        </div>
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </div>
      <div className="space-y-2">
        {bottomItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </div>
    </aside>
  )
}
