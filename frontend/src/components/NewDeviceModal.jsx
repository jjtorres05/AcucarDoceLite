import { useState } from 'react'
import { X, Plus, Cpu, Info, Copy, Check, Key, Router } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { createMachine } from '../services/machines'

export default function NewDeviceModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name || !model) return
    try {
      setLoading(true)
      setError('')
      const data = await createMachine(name, model)
      setToken(data.key || '')
      setCreated(true)
    } catch (err) {
      setError(err.message || 'Erro ao criar dispositivo')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Router size={18} />
            <span className="font-semibold text-sm">Novo Dispositivo</span>
          </div>
          <button onClick={() => { if (created) onCreated?.(); onClose(); }} className="text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <Input
            label="Nome"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exp: Sensor De Humidade, Armazém-C"
            hint="O nome desse dispositivo deve ser único."
          />

          <Input
            label="Modelo"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Exp: ESPN-32"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-center gap-3 pt-2">
            <Button type="button" variant="muted" onClick={() => { if (created) onCreated?.(); onClose(); }}>
              {created ? 'Fechar' : 'Cancelar'}
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus size={14} />
              {loading ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>

        {created && token && (
          <div className="mx-5 mb-5 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <Key size={16} className="text-navy-900" />
              <span className="font-semibold text-sm text-navy-900">Token de autenticação</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <code className="text-lg text-navy-900 font-mono">{token}</code>
                <button onClick={handleCopy} className="text-gray-400 hover:text-navy-900 transition cursor-pointer ml-auto">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="mx-4 mb-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600">
                O token será exibido uma única vez após o cadastro. Guarde-o em um lugar seguro — ele será usado pelo dispositivo físico para se autenticar na plataforma.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
