const nameToColor = {
  'Normal': 'bg-green-500',
  'Precaução': 'bg-orange-400',
  'Crítico': 'bg-red-500',
}

function timeAgo(minutes) {
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function fmt(v) {
  return Number(v).toFixed(2)
}

export default function ReadingBar({ value, min = 0, max, unit, ago, activationRanges }) {
  const hasValue = value !== undefined && value !== null
  const range = max - min
  const pct = hasValue && range > 0 ? Math.min(Math.max(((value - min) / range) * 100, 0), 100) : 50

  const zones = activationRanges && activationRanges.length > 0
    ? activationRanges.map(r => ({
        from: r.lowerBound,
        to: r.upperBound,
        color: nameToColor[r.name] || 'bg-green-500',
      }))
    : [{ from: 0, to: 100, color: 'bg-gray-300' }]

  const barMin = activationRanges?.length > 0 ? min : 0
  const barMax = activationRanges?.length > 0 ? max : 100
  const barRange = barMax - barMin || 1

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
        <span>{fmt(barMin)}{unit}</span>
        <span>{fmt(barMax)}{unit}</span>
      </div>
      <div className="relative w-full h-3 rounded-full overflow-hidden flex">
        {zones.map((z, i) => {
          const width = ((z.to - z.from) / barRange) * 100
          return (
            <div
              key={i}
              className={`h-full ${z.color}`}
              style={{ width: `${Math.max(width, 0)}%` }}
            />
          )
        })}
        {hasValue && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-0.5">
        {hasValue ? (
          <span className="text-xs text-navy-900 font-semibold">{fmt(value)}{unit}</span>
        ) : (
          <span className="text-[10px] text-gray-400">Sem leitura</span>
        )}
        {ago !== undefined && (
          <span className="text-[10px] text-gray-400">{timeAgo(ago)}</span>
        )}
      </div>
    </div>
  )
}
