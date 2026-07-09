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

export default function LineChart({ data, series, title, height = 200 }) {
  const seriesKeys = Object.keys(series)
  const labels = data.map((d) => d.label)

  const datasets = seriesKeys.map((key) => {
    const s = series[key]
    if (s.pointOnly) {
      return {
        label: s.label,
        data: data.map((d) => d[key]),
        borderColor: 'transparent',
        backgroundColor: s.color,
        borderWidth: 0,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: s.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        showLine: false,
        fill: false,
      }
    }
    return {
      label: s.label,
      data: data.map((d) => d[key]),
      borderColor: s.color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.3,
      fill: false,
    }
  })

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
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
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
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 10 }, color: '#9ca3af' },
      },
    },
  }

  const chartIcon = (
    <svg viewBox="0 0 20 20" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15l4-6 4 4 6-10" />
    </svg>
  )

  return (
    <GoldPanel title={title} icon={chartIcon}>
      <div className="pt-3" style={{ height }}>
        <Line data={chartData} options={options} />
      </div>
    </GoldPanel>
  )
}
