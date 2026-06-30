import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Cpu, Activity, CircleDot, BarChart3, Search, Settings, Airplay, SatelliteDish, Router, ToggleRight, User } from 'lucide-react'
import logoImg from '../assets/favicon.svg'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { icon: LayoutDashboard, to: '/dashboard', label: 'Dashboard' },
  { icon: Router, to: '/dispositivos', label: 'Dispositivos' },
  { icon: SatelliteDish, to: '/sensores', label: 'Sensores' },
  { icon: ToggleRight, to: '/atuadores', label: 'Atuadores' },
  { icon: BarChart3, to: '/relatorios', label: 'Relatórios' },
]

const bottomItems = [
  { icon: User, to: '/buscar', label: 'Buscar' },
  { icon: Settings, to: '/configuracoes', label: 'Configurações' },
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

export default function Sidebar({onLogout}) {
  const navigate = useNavigate()
  const handleLogout = ()=>{
    onLogout()
    navigate('/login')
  }
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
        <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 rounded-lg transition text-gray-400 hover:text-red-400 hover:bg-navy-700" title="Sair">
          <LogOut size={20}/>
        </button>
      </div>
    </aside>
  )
}
