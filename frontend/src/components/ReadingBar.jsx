function timeAgo(minutes) {
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

export default function ReadingBar({ value, min = 0, max, unit, ago }) {
  const range = max - min
  const pct = Math.min(Math.max(((value - min) / range) * 100, 0), 100)

  const zones = [
    { from: 0, to: 15, color: 'bg-red-500' },
    { from: 15, to: 25, color: 'bg-orange-400' },
    { from: 25, to: 75, color: 'bg-green-500' },
    { from: 75, to: 85, color: 'bg-orange-400' },
    { from: 85, to: 100, color: 'bg-red-500' },
  ]

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <div className="relative w-full h-3 rounded-full overflow-hidden flex">
        {zones.map((z, i) => (
          <div
            key={i}
            className={`h-full ${z.color}`}
            style={{ width: `${z.to - z.from}%` }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-xs text-navy-900 font-semibold">{value}{unit}</span>
        {ago !== undefined && (
          <span className="text-[10px] text-gray-400">{timeAgo(ago)}</span>
        )}
      </div>
    </div>
  )
}
