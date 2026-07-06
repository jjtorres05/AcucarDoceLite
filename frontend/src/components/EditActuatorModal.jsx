import { useState, useEffect } from 'react'
import { X, Save, CircleDot, Info, Cpu, Activity } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import CustomSelect from './CustomSelect'
import { updateActuator } from '../services/actuators'
import { getMachines } from '../services/machines'
import { getSensors } from '../services/sensors'

export default function EditActuatorModal({ actuator, onClose, onUpdated }) {
  const [machines, setMachines] = useState([])
  const [sensors, setSensors] = useState([])
  const [name, setName] = useState(actuator.actuatorName)
  const [model, setModel] = useState(actuator.actuatorModel)
  const [active, setActive] = useState(actuator.actuatorStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMachines().then(setMachines).catch(() => {})
    getSensors().then(setSensors).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !model) return
    try {
      setLoading(true)
      setError('')
      await updateActuator(actuator.actuatorId, { name, model, active })
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao atualizar atuador')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <CircleDot size={18} />
            <span className="font-semibold text-sm">Editar Atuador</span>
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

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-600">
              Para alterar o dispositivo ou sensor vinculado, exclua e crie um novo atuador.
            </p>
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
    </div>
  )
}
