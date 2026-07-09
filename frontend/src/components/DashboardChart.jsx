import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import GoldPanel from './GoldPanel'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function DashboardChart({ data, title, height = 220 }) {
  const labels = data.map((d) => d.label)
  const avgValues = data.map((d) => d.avg)
  const maxValues = data.map((d) => d.max)

  const avgOfAll = avgValues.reduce((a, b) => a + b, 0) / avgValues.length
  const stdDev = Math.sqrt(avgValues.reduce((s, v) => s + (v - avgOfAll) ** 2, 0) / avgValues.length)
  const criticalThreshold = avgOfAll + stdDev * 1.5

  const criticalPoints = maxValues.map((v) => (v >= criticalThreshold ? v : null))
  const hasCritical = criticalPoints.some((v) => v !== null)

  const datasets = [
    {
      label: 'Média',
      data: avgValues,
      borderColor: '#1e293b',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#1e293b',
      tension: 0.3,
      fill: false,
      order: 1,
    },
  ]

  if (hasCritical) {
    datasets.push({
      label: 'Pico crítico',
      data: maxValues,
      borderColor: '#ef444440',
      backgroundColor: '#ef4444',
      borderWidth: 1.5,
      borderDash: [4, 3],
      pointRadius: maxValues.map((v) => (v >= criticalThreshold ? 5 : 0)),
      pointHoverRadius: maxValues.map((v) => (v >= criticalThreshold ? 7 : 0)),
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      tension: 0.3,
      fill: false,
      order: 0,
    })
  }

  const chartData = { labels, datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11 },
          filter: (item) => item.text !== '',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: (v) => Number(v).toFixed(1),
        },
      },
    },
  }

  const chartIcon = (
    <svg viewBox="0 0 20 20" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15l4-6 4 4 6-10" />
    </svg>
  )

  return (
    <GoldPanel title={title} icon={chartIcon} actionLabel="7D">
      <div className="pt-3" style={{ height }}>
        <Line data={chartData} options={options} />
      </div>
    </GoldPanel>
  )
}
