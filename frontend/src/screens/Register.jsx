import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import Button from '../components/Button'
import iotIllustration from '../assets/ChatGPT Image 15 jun 2026, 01_49_15 p.m..png'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-10">
        <Logo size="lg" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <img
            src={iotIllustration}
            alt="IoT Illustration"
            className="w-full max-w-lg object-contain"
          />
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Plataforma completa para monitoramento industrial em tempo real
          </p>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 flex items-center gap-6 border border-navy-700">
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
            <h1 className="text-2xl font-semibold text-navy-900">Crie sua conta</h1>
            <p className="text-gray-500 text-sm mt-1">Preencha os dados abaixo para se registrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="Seu nome"
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="seu@email.com"
            />

            <PasswordInput
              label="Senha"
              value={form.password}
              onChange={update('password')}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            />

            <PasswordInput
              label="Confirmar senha"
              value={form.confirm}
              onChange={update('confirm')}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            />

            <Button type="submit" variant="gold" className="w-full">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
