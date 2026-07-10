import { useState } from 'react'
import { X, Save, Activity, Plus, ChevronDown } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { updateSensor, updateSensorRanges } from '../services/sensors'

const colorToName = {
  'bg-green-500': 'Normal',
  'bg-orange-400': 'Precaução',
  'bg-red-500': 'Crítico',
}

const nameToColor = {
  'Normal': 'bg-green-500',
  'Precaução': 'bg-orange-400',
  'Crítico': 'bg-red-500',
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
    let color = zones.length === 0 ? 'bg-gray-300' : 'bg-red-500'
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

function ZoneInput({ zone, onChange, onRemove }) {
  const colorOptions = [
    { value: 'bg-green-500', label: 'Normal' },
    { value: 'bg-orange-400', label: 'Precaução' },
    { value: 'bg-red-500', label: 'Crítico' },
  ]

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 mb-0.5">De</label>
        <input
          type="number"
          value={zone.from}
          onChange={(e) => onChange({ ...zone, from: e.target.value === '' ? '' : Number(e.target.value) })}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 mb-0.5">Até</label>
        <input
          type="number"
          value={zone.to}
          onChange={(e) => onChange({ ...zone, to: e.target.value === '' ? '' : Number(e.target.value) })}
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

export default function EditSensorModal({ sensor, onClose, onUpdated }) {
  const [name, setName] = useState(sensor.sensorName)
  const [model, setModel] = useState(sensor.sensorModel)
  const [active, setActive] = useState(sensor.sensorStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const existingRanges = sensor.activationRanges || []

  const [min, setMin] = useState(sensor.sensorMinRange ?? 0)
  const [max, setMax] = useState(sensor.sensorMaxRange ?? 100)
  const [zones, setZones] = useState(
    existingRanges.length > 0
      ? existingRanges.map(r => ({
          from: r.lowerBound,
          to: r.upperBound,
          color: nameToColor[r.name] || 'bg-green-500',
        }))
      : [{ from: 0, to: 100, color: 'bg-green-500' }]
  )

  const updateZone = (index, updated) => {
    if (updated.from < min) updated.from = min
    if (updated.to > max) updated.to = max
    if (updated.from > updated.to) updated.from = updated.to
    const next = [...zones]
    next[index] = updated
    setZones(next)
  }

  const addZone = () => {
    const lastTo = zones.length > 0 ? zones[zones.length - 1].to : min
    setZones([...zones, { from: lastTo, to: lastTo, color: 'bg-green-500' }])
  }

  const removeZone = (index) => {
    setZones(zones.filter((_, i) => i !== index))
  }

  const zonesOverlap = () => {
    const sorted = [...zones].sort((a, b) => a.from - b.from)
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].from < sorted[i - 1].to) return true
    }
    return false
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !model.trim()) return
    if (zonesOverlap()) {
      setError('As faixas não podem se sobrepor')
      return
    }
    try {
      setLoading(true)
      setError('')

      const ranges = zones.map(z => ({
        name: colorToName[z.color] || 'Normal',
        lowerBound: z.from,
        upperBound: z.to,
      }))

      await updateSensor(sensor.sensorId, { name, model, active, minRange: Number(min), maxRange: Number(max) })
      await updateSensorRanges(sensor.sensorId, ranges, existingRanges)
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao atualizar sensor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-white">
            <Activity size={18} />
            <span className="font-semibold text-sm">Editar Sensor</span>
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

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">Faixas de Alerta</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Máximo</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
              />
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
                onChange={(updated) => updateZone(i, updated)}
                onRemove={() => removeZone(i)}
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
