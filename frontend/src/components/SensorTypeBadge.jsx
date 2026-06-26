import { Thermometer, Sun, Droplets, FlaskConical } from 'lucide-react'

const types = {
  Temperatura: { icon: Thermometer, bg: 'bg-red-50', text: 'text-red-600' },
  Luminosidade: { icon: Sun, bg: 'bg-yellow-50', text: 'text-yellow-600' },
  Humidade: { icon: Droplets, bg: 'bg-blue-50', text: 'text-blue-600' },
  PH: { icon: FlaskConical, bg: 'bg-purple-50', text: 'text-purple-600' },
}

export default function SensorTypeBadge({ type }) {
  const config = types[type] || { icon: FlaskConical, bg: 'bg-gray-50', text: 'text-gray-600' }
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={13} />
      {type}
    </span>
  )
}
