import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Logo from '../components/Logo'
import Input from '../components/Input'
import CompanyCard from '../components/CompanyCard'
import { getCompanies } from '../services/auth'

export default function SelectCompany({ onLogin }) {
  const [search, setSearch] = useState('')
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.companies) {
      setCompanies(location.state.companies)
    } else {
      setLoading(true)
      getCompanies()
        .then(setCompanies)
        .catch(() => navigate('/login'))
        .finally(() => setLoading(false))
    }
  }, [])

  const getCompanyData = (item) => item.company || item
  const getRole = (item) => item.roleCompany ?? 0

  const filtered = companies.filter((c) =>
    getCompanyData(c).name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (item) => {
    const company = getCompanyData(item)
    onLogin(company.id, company.name, getRole(item))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy-900 px-6 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <button className="flex items-center gap-2 text-white text-sm hover:text-gold-300 transition cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
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
          {filtered.map((item) => {
            const company = getCompanyData(item)
            return (
              <CompanyCard
                key={company.id}
                name={company.name}
                onClick={() => handleSelect(item)}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
