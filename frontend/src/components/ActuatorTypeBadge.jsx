import { DoorOpen, Droplets, Settings2, Fan, Waves } from 'lucide-react'

const types = {
  Porta: { icon: DoorOpen, bg: 'bg-amber-50', text: 'text-amber-600' },
  Irrigador: { icon: Droplets, bg: 'bg-blue-50', text: 'text-blue-600' },
  Motor: { icon: Settings2, bg: 'bg-gray-100', text: 'text-gray-600' },
  Ventilador: { icon: Fan, bg: 'bg-teal-50', text: 'text-teal-600' },
  Outro: { icon: Waves, bg: 'bg-purple-50', text: 'text-purple-600' },
}

export default function ActuatorTypeBadge({ type }) {
  const config = types[type] || { icon: Settings2, bg: 'bg-gray-50', text: 'text-gray-600' }
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={13} />
      {type}
    </span>
  )
}
