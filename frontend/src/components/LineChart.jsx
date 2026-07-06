import { useState } from 'react'
import GoldPanel from './GoldPanel'

export default function LineChart({ data, series, title, height = 200 }) {
  const [period, setPeriod] = useState('7D')

  const seriesKeys = Object.keys(series)
  const allValues = data.flatMap((d) => seriesKeys.map((k) => d[k]))
  const maxVal = Math.max(...allValues)
  const minVal = Math.min(...allValues)
  const range = maxVal - minVal || 1
  const padTop = 20
  const padBottom = 30
  const padLeft = 40
  const padRight = 20
  const chartW = 500
  const chartH = height

  const toX = (i) => padLeft + (i / (data.length - 1)) * (chartW - padLeft - padRight)
  const toY = (v) => padTop + ((maxVal - v) / range) * (chartH - padTop - padBottom)

  const makePath = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d[key])}`).join(' ')

  const step = Math.ceil(range / 4)
  const midVal = Math.round((maxVal + minVal) / 2)
  const yTicks = [midVal - step * 2, midVal - step, midVal, midVal + step]

  const chartIcon = (
    <svg viewBox="0 0 20 20" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15l4-6 4 4 6-10" />
    </svg>
  )

  return (
    <GoldPanel
      title={title}
      icon={chartIcon}
      actionLabel={period}
    >
      <div className="pt-3">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height }}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={padLeft} x2={chartW - padRight} y1={toY(t)} y2={toY(t)} stroke="#e5e7eb" strokeWidth="0.5" />
              <text x={padLeft - 8} y={toY(t) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{t}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.label} x={toX(i)} y={chartH - 5} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {d.label}
            </text>
          ))}
          {seriesKeys.map((key) => (
            <g key={key}>
              <path d={makePath(key)} fill="none" stroke={series[key].color} strokeWidth="2" />
              {data.map((d, i) => (
                <circle key={i} cx={toX(i)} cy={toY(d[key])} r="3" fill={series[key].color} />
              ))}
            </g>
          ))}
        </svg>
        <div className="flex items-center justify-center gap-5 mt-3">
          {seriesKeys.map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: series[key].color }} />
              <span className="text-xs text-gray-500">{series[key].label}</span>
            </div>
          ))}
        </div>
      </div>
    </GoldPanel>
  )
}
