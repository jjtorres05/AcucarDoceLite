import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-navy-900">404</h1>
        <p className="text-xl text-gray-500 mt-4">Página não encontrada</p>
        <p className="text-sm text-gray-400 mt-2">A página que você procura não existe ou foi removida.</p>
        <Link
          to="/dashboard"
          className="inline-block mt-8 px-6 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-400 transition"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
