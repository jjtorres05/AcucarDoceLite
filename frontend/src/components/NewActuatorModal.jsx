import { useState, useEffect } from 'react'
import { X, Plus, CircleDot, Info, Cpu, Activity, SatelliteDish, Router } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import CustomSelect from './CustomSelect'
import { createActuator } from '../services/actuators'
import { getMachines } from '../services/machines'
import { getSensors } from '../services/sensors'

export default function NewActuatorModal({ onClose, onCreated }) {
  const [machines, setMachines] = useState([])
  const [sensors, setSensors] = useState([])
  const [device, setDevice] = useState('')
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [sensor, setSensor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMachines().then(setMachines).catch(() => {})
    getSensors().then(setSensors).catch(() => {})
  }, [])

  const deviceOptions = machines.map(m => ({
    value: m.id,
    label: m.name,
    sub: m.model,
    icon: <Router size={14} className="text-navy-900" />,
    iconBg: 'bg-blue-50',
    badge: m.active ? 'Ativo' : 'Inativo',
    badgeClass: m.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
  }))

  const sensorOptions = sensors.map(s => ({
    value: s.sensorId,
    label: s.sensorName,
    sub: `${s.sensorModel} · ${s.machineName}`,
    icon: <SatelliteDish size={14} className="text-blue-500" />,
    iconBg: 'bg-blue-50',
    badge: s.sensorStatus ? 'Ativo' : 'Inativo',
    badgeClass: s.sensorStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
  }))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || !model.trim() || !device) return
    try {
      setLoading(true)
      setError('')
      const body = { name, model, machineId: device }
      if (sensor) body.sensorId = sensor
      await createActuator(body)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao criar atuador')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-white">
            <CircleDot size={18} />
            <span className="font-semibold text-sm">Novo Atuador</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-5">
          <CustomSelect
            label="Dispositivo"
            required
            placeholder="Selecionar um dispositivo"
            value={device}
            onChange={setDevice}
            options={deviceOptions}
            hint="O atuador será vinculado a esse dispositivo."
          />

          <Input
            label="Nome"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exp: Válvula de água, Ventilador"
          />

          <Input
            label="Modelo"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Exp: Irrigador, Motor DC"
          />

          <CustomSelect
            label="Sensor"
            placeholder="Selecionar um sensor (opcional)"
            value={sensor}
            onChange={setSensor}
            options={sensorOptions}
            hint="Quando vinculado, este atuador responde automaticamente às leituras deste sensor."
          />

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-600">
              Um sensor pode controlar vários atuadores, mas cada atuador só pode ter um sensor de controle.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-center gap-3 pt-2">
            <Button type="button" variant="muted" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus size={14} />
              {loading ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
