import { useState } from 'react'
import { X, Save, Cpu, RefreshCw, Copy, Check, Key, Info } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import ConfirmModal from './ConfirmModal'
import { updateMachine } from '../services/machines'

export default function EditDeviceModal({ device, onClose, onUpdated }) {
  const [name, setName] = useState(device.name)
  const [model, setModel] = useState(device.model)
  const [active, setActive] = useState(device.active)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newToken, setNewToken] = useState('')
  const [resetting, setResetting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !model.trim()) return
    try {
      setLoading(true)
      setError('')
      await updateMachine(device.id, { name, model, active })
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dispositivo')
    } finally {
      setLoading(false)
    }
  }

  const handleResetToken = async () => {
    setConfirmReset(false)
    try {
      setResetting(true)
      setError('')
      const newKey = crypto.randomUUID()
      const data = await updateMachine(device.id, { key: newKey })
      setNewToken(data?.key || newKey)
    } catch (err) {
      setError(err.message || 'Erro ao resetar token')
    } finally {
      setResetting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Cpu size={18} />
            <span className="font-semibold text-sm">Editar Dispositivo</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Nome"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Modelo"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="ml-2 text-sm text-gray-600">{active ? 'Ativo' : 'Inativo'}</span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Token de Autenticação</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} />
                {resetting ? 'Resetando...' : 'Resetar Token'}
              </button>
            </div>

            {newToken && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-3 flex items-center gap-2">
                  <code className="text-sm text-navy-900 font-mono flex-1 break-all">{newToken}</code>
                  <button type="button" onClick={handleCopy} className="text-gray-400 hover:text-navy-900 transition cursor-pointer shrink-0">
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="mx-3 mb-3 flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <Info size={12} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-600">
                    Guarde o novo token — o anterior foi invalidado.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-center gap-3 pt-2">
            <Button type="button" variant="muted" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save size={14} />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
      {confirmReset && (
        <ConfirmModal
          title="Resetar token"
          message="Tem certeza que deseja resetar o token? O token anterior será invalidado."
          confirmLabel="Resetar"
          onConfirm={handleResetToken}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}
