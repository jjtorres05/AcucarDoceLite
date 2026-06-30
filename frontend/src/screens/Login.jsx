import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import Button from '../components/Button'
import { login, getCompanies } from '../services/auth'
import iotIllustration from '../assets/15 junio.png'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const companies = await getCompanies()

      if (companies.length === 1) {
        onLogin(companies[0].id)
        navigate('/dispositivos')
      } else {
        navigate('/empresas', { state: { companies } })
      }
    } catch (err) {
      setError(err.error?.message || 'Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-10 pt-18">
        <Logo size="lg" />

        <div className="flex-1 flex items-center justify-center px-4">
          <img
            src={iotIllustration}
            alt="IoT Illustration"
            className="w-full max-w-lg object-contain"
          />
        </div>

        <div className="bg-navy-800 rounded-xl p-6 flex items-center justify-around gap-8 border border-navy-700">
          <div className="text-center">
            <span className="text-gold-500 text-3xl font-bold">+100</span>
            <p className="text-white text-sm mt-1">empresas</p>
          </div>
          <div className="h-12 w-px bg-navy-600" />
          <div>
            <p className="text-white text-lg font-semibold">Monitoramento</p>
            <p className="text-gold-500 text-2xl font-bold">24/7</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <span className="text-2xl font-semibold">
              <span className="text-navy-900">acucar</span>
              <span className="text-gold-500">doce</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-navy-900">Bem-vindo de volta</h1>
            <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais para acessar o sistema</p>
          </div>

          {error && (
            <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />

            <PasswordInput
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;"
            />

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-gold-500 hover:text-gold-400 font-medium">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )

