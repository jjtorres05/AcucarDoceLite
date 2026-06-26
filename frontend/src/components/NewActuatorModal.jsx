import { useState } from 'react'
import { X, Plus, CircleDot, DoorOpen, Droplets, Settings2, Fan, Waves, Info, Cpu, Activity, Thermometer } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import CustomSelect from './CustomSelect'

const actuatorTypes = [
  { key: 'porta', label: 'Porta', icon: DoorOpen },
  { key: 'irrigador', label: 'Irrigador', icon: Droplets },
  { key: 'motor', label: 'Motor', icon: Settings2 },
  { key: 'ventilador', label: 'Ventilador', icon: Fan },
  { key: 'outro', label: 'Outro', icon: Waves },
]

const deviceOptions = [
  { value: 'caldeira-a', label: 'Caldeira-A', sub: 'ESPN-32 · 4 sensores', icon: <Cpu size={14} className="text-navy-900" />, iconBg: 'bg-blue-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'armazem-a', label: 'Armazém-A', sub: 'ESPN-33 · 3 sensores', icon: <Cpu size={14} className="text-navy-900" />, iconBg: 'bg-blue-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'caldeira-b', label: 'Caldeira-B', sub: 'ESPN-34 · 8 sensores', icon: <Cpu size={14} className="text-navy-900" />, iconBg: 'bg-blue-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'armazem-b', label: 'Armazém-B', sub: 'ESPN-35 · 2 sensores', icon: <Cpu size={14} className="text-navy-900" />, iconBg: 'bg-blue-50', badge: 'Inativo', badgeClass: 'bg-red-100 text-red-700' },
]

const sensorOptions = [
  { value: 'temp-sala-b', label: 'Sensor temperatura - Sala B', sub: 'Temperatura · 24°C', icon: <Thermometer size={14} className="text-red-500" />, iconBg: 'bg-red-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'luz-arroz', label: 'Sensor de luz - cultivo arroz', sub: 'Luminosidade · 850 lux', icon: <Activity size={14} className="text-yellow-500" />, iconBg: 'bg-yellow-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'ph-batata', label: 'Sensor PH - cultivo batata', sub: 'PH · 6.5', icon: <Activity size={14} className="text-purple-500" />, iconBg: 'bg-purple-50', badge: 'Inativo', badgeClass: 'bg-red-100 text-red-700' },
  { value: 'hum-armazem', label: 'Sensor Humidade - Armazém A', sub: 'Humidade · 78%', icon: <Droplets size={14} className="text-blue-500" />, iconBg: 'bg-blue-50', badge: 'Ativo', badgeClass: 'bg-green-100 text-green-700' },
]

export default function NewActuatorModal({ onClose }) {
  const [device, setDevice] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [sensor, setSensor] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (name && type && device) {
      onClose()
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
            placeholder="Exp: Temp Caldeira, Umidade Armazém"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500">* </span>Tipo
            </label>
            <div className="flex flex-wrap gap-2">
              {actuatorTypes.map((t) => {
                const Icon = t.icon
                const isSelected = type === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition cursor-pointer ${
                      isSelected
                        ? 'border-gold-500 bg-gold-100 text-gold-500 font-medium'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Selecione para preencher tipo e unidade automaticamente.</p>
          </div>

          <CustomSelect
            label="Sensor"
            placeholder="Selecionar um sensor"
            value={sensor}
            onChange={setSensor}
            options={sensorOptions}
            hint="Quando vinculado, este atuador responde automaticamente às leituras deste sensor."
          />

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-600">
              Somente sensores do mesmo dispositivo aparecem na lista. Um sensor pode controlar vários atuadores, mas cada atuador só pode ter um sensor de controle.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button type="button" variant="muted" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus size={14} />
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
