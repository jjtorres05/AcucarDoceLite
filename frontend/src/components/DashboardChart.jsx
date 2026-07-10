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
  const criticalValues = data.map((d) => d.critical)
  const warningValues = data.map((d) => d.warning)
  const hasCritical = criticalValues.some((v) => v !== null)
  const hasWarning = warningValues.some((v) => v !== null)

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
      order: 2,
    },
  ]

  if (hasCritical) {
    datasets.push({
      label: 'Crítico',
      data: criticalValues,
      borderColor: 'transparent',
      backgroundColor: '#ef4444',
      borderWidth: 0,
      pointRadius: criticalValues.map((v) => (v !== null ? 5 : 0)),
      pointHoverRadius: criticalValues.map((v) => (v !== null ? 7 : 0)),
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      showLine: false,
      fill: false,
      order: 0,
    })
  }

  if (hasWarning) {
    datasets.push({
      label: 'Precaução',
      data: warningValues,
      borderColor: 'transparent',
      backgroundColor: '#f59e0b',
      borderWidth: 0,
      pointRadius: warningValues.map((v) => (v !== null ? 5 : 0)),
      pointHoverRadius: warningValues.map((v) => (v !== null ? 7 : 0)),
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      showLine: false,
      fill: false,
      order: 1,
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
          label: (ctx) => {
            if (ctx.raw === null) return null
            return `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}`
          },
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
          maxTicksLimit: 14,
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
      <p className="text-[10px] text-gray-400 text-right mt-1">Pontos mostrados a cada 6h</p>
    </GoldPanel>
  )
}
