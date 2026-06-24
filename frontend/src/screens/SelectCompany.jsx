import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Logo from '../components/Logo'
import Input from '../components/Input'
import CompanyCard from '../components/CompanyCard'

const companies = [
  { id: 1, name: 'AcucarDoce Ltda', alerts: 4 },
  { id: 2, name: 'TechAgro Ltda', alerts: 3 },
  { id: 3, name: 'Fazendinha', alerts: 2 },
]

export default function SelectCompany() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy-900 px-6 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <button className="flex items-center gap-2 text-white text-sm hover:text-gold-300 transition cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Vinicius Jr
          <ChevronDown size={14} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto pt-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Selecione Uma Empresa</h1>
          <p className="text-gray-500 text-sm mt-1">Escolha Qual Empresa Deseja Gerenciar</p>
        </div>

        <div className="flex justify-center mb-10">
          <Input
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure Uma Empresa Pelo Nome"
            className="w-80"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              name={company.name}
              alerts={company.alerts}
              onClick={() => navigate('/dispositivos')}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
