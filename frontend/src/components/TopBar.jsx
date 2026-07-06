import { useLocation } from 'react-router-dom'
import { Building2, Cpu } from 'lucide-react'

const titles = {
  '/dispositivos': 'Dispositivos',
  '/sensores': 'Sensores',
  '/atuadores': 'Atuadores',
  '/dashboard': 'Dashboard',
  '/relatorios': 'Relatórios',
  '/buscar': 'Buscar',
  '/configuracoes': 'Configurações',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Dashboard'
  const companyName = localStorage.getItem('companyName') || 'Empresa'

  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-navy-900 font-medium">
          {companyName}
        </div>
        <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
      </div>
    </header>
  )
}
