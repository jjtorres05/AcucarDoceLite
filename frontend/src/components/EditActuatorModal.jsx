import { useState, useEffect } from 'react'
import { X, Save, CircleDot, Info, SatelliteDish } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import CustomSelect from './CustomSelect'
import { updateActuator } from '../services/actuators'
import { getSensors } from '../services/sensors'

export default function EditActuatorModal({ actuator, onClose, onUpdated }) {
  const [sensors, setSensors] = useState([])
  const [name, setName] = useState(actuator.actuatorName)
  const [model, setModel] = useState(actuator.actuatorModel)
  const [active, setActive] = useState(actuator.actuatorStatus)
  const [sensor, setSensor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSensors().then((data) => {
      setSensors(data)
      if (actuator.sensorName) {
        const match = data.find(s => s.sensorName === actuator.sensorName)
        if (match) setSensor(match.sensorId)
      }
    }).catch(() => {})
  }, [])

  const sensorOptions = [
    { value: '', label: 'Nenhum', sub: 'Remover vínculo', icon: <X size={14} className="text-gray-400" />, iconBg: 'bg-gray-100' },
    ...sensors.map(s => ({
      value: s.sensorId,
      label: s.sensorName,
      sub: `${s.sensorModel} · ${s.machineName}`,
      icon: <SatelliteDish size={14} className="text-blue-500" />,
      iconBg: 'bg-blue-50',
      badge: s.sensorStatus ? 'Ativo' : 'Inativo',
      badgeClass: s.sensorStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
    }))
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !model.trim()) return
    try {
      setLoading(true)
      setError('')
      const body = { name, model, active }
      if (sensor) body.sensorId = sensor
      await updateActuator(actuator.actuatorId, body)
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

          <CustomSelect
            label="Sensor de controle"
            placeholder="Selecionar um sensor (opcional)"
            value={sensor}
            onChange={setSensor}
            options={sensorOptions}
            hint="Sensor vinculado a este atuador."
          />

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
