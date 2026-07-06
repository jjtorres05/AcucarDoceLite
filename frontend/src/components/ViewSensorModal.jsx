import { X, Activity, Thermometer, Droplets, Sun, Waves, Settings2 } from 'lucide-react'
import Button from './Button'

const typeIcons = {
  temperatura: Thermometer,
  umidade: Droplets,
  luminosidade: Sun,
  vibracao: Waves,
}

const colorForRange = {
  'Normal': 'bg-green-500',
  'Precaução': 'bg-orange-400',
  'Crítico': 'bg-red-500',
}

function AlertBar({ ranges }) {
  if (!ranges || ranges.length === 0) return null

  const allBounds = ranges.flatMap(r => [r.lowerBound, r.upperBound])
  const min = Math.min(...allBounds)
  const max = Math.max(...allBounds)
  const total = max - min
  if (total <= 0) return null

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className="w-full h-5 rounded-full overflow-hidden flex">
        {ranges.map((r, i) => {
          const width = ((r.upperBound - r.lowerBound) / total) * 100
          const color = colorForRange[r.name] || 'bg-gray-400'
          return (
            <div
              key={i}
              className={`h-full ${color} transition-all`}
              style={{ width: `${width}%` }}
              title={`${r.name}: ${r.lowerBound} - ${r.upperBound}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function ViewSensorModal({ sensor, reading, onClose }) {
  const TypeIcon = typeIcons[sensor.sensorType] || Settings2

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-gold-500 rounded-t-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Activity size={18} />
            <span className="font-semibold text-sm">Detalhes do Sensor</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TypeIcon size={20} className="text-navy-900" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">{sensor.sensorName}</h3>
              <p className="text-xs text-gray-400">{sensor.sensorModel}</p>
            </div>
            <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${
              sensor.sensorStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {sensor.sensorStatus ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tipo</p>
              <p className="text-sm font-medium text-navy-900 mt-0.5">{sensor.sensorType || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Unidade</p>
              <p className="text-sm font-medium text-navy-900 mt-0.5">{sensor.sensorUnit || sensor.unit || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dispositivo</p>
              <p className="text-sm font-medium text-navy-900 mt-0.5">{sensor.machineName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Atuadores</p>
              <p className="text-sm font-medium text-navy-900 mt-0.5">
                {(sensor.numberActiveActuator || 0) + (sensor.numberInactiveActuator || 0)}
                <span className="text-xs text-gray-400 ml-1">({sensor.numberActiveActuator || 0} ativos)</span>
              </p>
            </div>
          </div>

          {reading && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Leitura Atual</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-navy-900">{reading.value}</span>
                <span className="text-sm text-gray-500">{sensor.sensorUnit || sensor.unit || ''}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Faixa: {reading.range?.name || '—'} ({reading.min} — {reading.max})
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Faixas de Ativação</p>
            {sensor.activationRanges && sensor.activationRanges.length > 0 ? (
              <>
                <AlertBar ranges={sensor.activationRanges} />
                <div className="mt-3 space-y-1.5">
                  {sensor.activationRanges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-3 h-3 rounded ${colorForRange[r.name] || 'bg-gray-400'}`} />
                      <span className="text-gray-700">{r.name}</span>
                      <span className="text-gray-400 ml-auto">{r.lowerBound} — {r.upperBound}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Nenhuma faixa definida</p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <Button type="button" variant="muted" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
