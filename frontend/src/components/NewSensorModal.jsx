import { useState } from 'react'
import { X, Plus, Activity, Thermometer, Droplets, Sun, Waves, Settings2, ChevronDown } from 'lucide-react'
import Button from './Button'
import Input from './Input'

const sensorTypes = [
  { key: 'temperatura', label: 'temperatura', icon: Thermometer },
  { key: 'umidade', label: 'Umidade', icon: Droplets },
  { key: 'luminosidade', label: 'luminosidade', icon: Sun },
  { key: 'vibracao', label: 'Vibração', icon: Waves },
  { key: 'outro', label: 'Outro', icon: Settings2 },
]

const typeUnits = {
  temperatura: '°C',
  umidade: '%',
  luminosidade: 'lux',
  vibracao: 'mm/s',
  outro: '',
}

function AlertBar({ min, max, zones }) {
  const range = max - min
  if (range <= 0) return null

  const allBounds = [min, ...zones.flatMap(z => [z.from, z.to]), max].sort((a, b) => a - b)
  const segments = []

  for (let i = 0; i < allBounds.length - 1; i++) {
    const segFrom = allBounds[i]
    const segTo = allBounds[i + 1]
    const width = ((segTo - segFrom) / range) * 100

    let color = 'bg-red-500'
    for (const z of zones) {
      if (segFrom >= z.from && segTo <= z.to) {
        color = z.color
        break
      }
    }

    segments.push({ width, color, from: segFrom, to: segTo })
  }

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className="w-full h-5 rounded-full overflow-hidden flex">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`h-full ${seg.color} transition-all`}
            style={{ width: `${seg.width}%` }}
            title={`${seg.from} - ${seg.to}`}
          />
        ))}
      </div>
    </div>
  )
}

function ZoneInput({ zone, onChange, onRemove, unit }) {
  const colorOptions = [
    { value: 'bg-green-500', label: 'Normal', dot: 'bg-green-500' },
    { value: 'bg-orange-400', label: 'Precaução', dot: 'bg-orange-400' },
    { value: 'bg-red-500', label: 'Crítico', dot: 'bg-red-500' },
  ]

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 mb-0.5">De</label>
        <input
          type="number"
          value={zone.from}
          onChange={(e) => onChange({ ...zone, from: Number(e.target.value) })}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 mb-0.5">Até</label>
        <input
          type="number"
          value={zone.to}
          onChange={(e) => onChange({ ...zone, to: Number(e.target.value) })}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 mb-0.5">Estado</label>
        <div className="relative">
          <select
            value={zone.color}
            onChange={(e) => onChange({ ...zone, color: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition appearance-none bg-white cursor-pointer pl-7"
          >
            {colorOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${zone.color}`} />
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 transition cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default function NewSensorModal({ onClose }) {
  const [device, setDevice] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [unit, setUnit] = useState('')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)
  const [zones, setZones] = useState([
    { from: 0, to: 15, color: 'bg-red-500' },
    { from: 15, to: 25, color: 'bg-orange-400' },
    { from: 25, to: 75, color: 'bg-green-500' },
    { from: 75, to: 85, color: 'bg-orange-400' },
    { from: 85, to: 100, color: 'bg-red-500' },
  ])

  const handleTypeSelect = (key) => {
    setType(key)
    setUnit(typeUnits[key])
  }

  const updateZone = (index, updated) => {
    const next = [...zones]
    next[index] = updated
    setZones(next)
  }

  const addZone = () => {
    setZones([...zones, { from: 0, to: 0, color: 'bg-green-500' }])
  }

  const removeZone = (index) => {
    setZones(zones.filter((_, i) => i !== index))
  }

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
            <Activity size={18} />
            <span className="font-semibold text-sm">Novo Sensor</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500">* </span>Dispositivo
            </label>
            <div className="relative">
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition appearance-none bg-white cursor-pointer"
              >
                <option value="">Selecionar Um Dispositivo</option>
                <option value="espn-32">ESPN-32 Sala B</option>
                <option value="espn-33">ESPN-33 Cultivo Arroz</option>
                <option value="espn-34">ESPN-34 Cultivo Batata</option>
                <option value="espn-35">ESPN-35 Armazem A</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-400 mt-1">O sensor será vinculado a esse dispositivo.</p>
          </div>

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
              {sensorTypes.map((t) => {
                const Icon = t.icon
                const isSelected = type === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleTypeSelect(t.key)}
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

          <Input
            label="Unidade"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="°C"
          />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">Customização</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500">* </span>Faixa De Alerta
            </label>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  placeholder="0..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  placeholder="100..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Zonas</label>
              <button
                type="button"
                onClick={addZone}
                className="text-xs text-gold-500 hover:text-gold-400 font-medium cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={12} />
                Adicionar zona
              </button>
            </div>
            {zones.map((zone, i) => (
              <ZoneInput
                key={i}
                zone={zone}
                unit={unit}
                onChange={(updated) => updateZone(i, updated)}
                onRemove={zones.length > 1 ? () => removeZone(i) : null}
              />
            ))}
          </div>

          <AlertBar min={min} max={max} zones={zones} />

          <div className="flex gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded bg-green-500" /> Normal
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded bg-orange-400" /> Precaução
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded bg-red-500" /> Crítico
            </span>
          </div>

          <p className="text-xs text-gray-400">
            * Leituras fora dessas faixas aparecem automaticamente nos sensores em atenção na página principal.
          </p>

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
