import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Router,
  SatelliteDish,
  ToggleRight,
  AlertTriangle,
  Info,
} from 'lucide-react'
import GoldPanel from '../components/GoldPanel'
import ReadingBar from '../components/ReadingBar'
import DashboardChart from '../components/DashboardChart'
import { getMachines } from '../services/machines'
import { getSensors } from '../services/sensors'
import { getActuators } from '../services/actuators'
import { getDashboardData, getPlotData } from '../services/registry'

function fmt(v) {
  return Number(v).toFixed(2)
}

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  return `Há ${Math.floor(hours / 24)}d`
}

function getSeverity(reading) {
  if (!reading.range) return 'critical'
  const name = reading.range.name?.toLowerCase() || ''
  if (name === 'normal') return 'ok'
  if (name.includes('crit') || name.includes('danger') || name.includes('perigo')) return 'critical'
  return 'warning'
}

function formatPlotForChart(plotData) {
  if (!plotData || plotData.length === 0) return null
  const raw = plotData[0]
  if (!raw?.readsAggByHour || raw.readsAggByHour.length === 0) return null

  const data = raw.readsAggByHour.map((point) => {
    const d = new Date(point.timestamp)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const hour = d.getHours().toString().padStart(2, '0')
    return {
      label: `${day}/${month} ${hour}h`,
      avg: Math.round(point.avgHour * 100) / 100,
      max: Math.round(point.maxHour * 100) / 100,
    }
  })

  const step = Math.max(1, Math.floor(data.length / 12))
  return data.filter((_, i) => i % step === 0 || i === data.length - 1)
}

function SensorBar({ sensor, sensorName, sensorData, onClick }) {
  const severity = getSeverity(sensor)
  const unit = sensorData?.sensorUnit || sensorData?.unit || ''
  const activationRanges = sensorData?.activationRanges || []

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
        severity === 'critical' ? 'bg-red-500' : severity === 'warning' ? 'bg-amber-500' : 'bg-green-500'
      }`} />
      <div className="min-w-[100px]">
        <p className="text-sm font-semibold text-navy-900">{sensorName || sensor.sensorId.slice(0, 8) + '...'}</p>
        <p className="text-xs text-gray-400">{sensor.range?.name || 'Sem faixa'}</p>
      </div>
      <div className="flex-1 mx-2">
        <ReadingBar
          value={sensor.value}
          min={sensor.min}
          max={sensor.max}
          unit={unit}
          ago={(() => {
            if (!sensor.timestamp) return undefined
            return Math.floor((Date.now() - new Date(sensor.timestamp).getTime()) / 60000)
          })()}
          activationRanges={activationRanges}
        />
      </div>
      <span className={`text-2xl font-bold shrink-0 ${
        severity === 'critical' ? 'text-red-500' : severity === 'warning' ? 'text-amber-500' : 'text-green-500'
      }`}>
        {fmt(sensor.value)}{unit}
      </span>
    </div>
  )
}

function AlertRow({ alert, onClick }) {
  const iconMap = {
    critical: <AlertTriangle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
  }

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
    >
      <div className="mt-0.5 shrink-0">{iconMap[alert.icon]}</div>
      <div>
        <p className="text-sm font-medium text-navy-900">{alert.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{alert.detail}</p>
      </div>
    </div>
  )
}

function EmptyMessage({ text }) {
  return (
    <p className="text-sm text-gray-400 text-center py-6">{text}</p>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState(null)
  const [sensors, setSensors] = useState(null)
  const [actuators, setActuators] = useState(null)
  const [dashboardReadings, setDashboardReadings] = useState([])
  const [alertPlots, setAlertPlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.allSettled([
        getMachines(),
        getSensors(),
        getActuators(),
        getDashboardData(),
      ])
      if (results[0].status === 'fulfilled') setDevices(results[0].value)
      if (results[1].status === 'fulfilled') setSensors(results[1].value)
      if (results[2].status === 'fulfilled') setActuators(results[2].value)
      if (results[3].status === 'fulfilled' && results[3].value) {
        setDashboardReadings(results[3].value.notifications)
        const alertIds = results[3].value.alertSensors || []
        if (alertIds.length > 0) {
          const plotResults = await Promise.allSettled(
            alertIds.slice(0, 4).map(id => getPlotData(id).then(data => ({ sensorId: id, data })))
          )
          const loaded = plotResults
            .filter(r => r.status === 'fulfilled' && r.value.data?.length > 0)
            .map(r => r.value)
          setAlertPlots(loaded)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const sensorNameMap = {}
  const sensorDataMap = {}
  if (sensors) {
    for (const s of sensors) {
      sensorNameMap[s.sensorId] = s.sensorName
      sensorDataMap[s.sensorId] = s
    }
  }

  const sensoresAtencao = dashboardReadings.filter((r) => {
    const severity = getSeverity(r)
    return severity !== 'ok'
  })

  const alertas = sensoresAtencao.map((r) => {
    const severity = getSeverity(r)
    return {
      icon: severity === 'critical' ? 'critical' : 'warning',
      message: `Sensor ${sensorNameMap[r.sensorId] || r.sensorId.slice(0, 8) + '...'} — valor ${fmt(r.value)} (${r.range?.name || 'fora de faixa'})`,
      detail: `${timeAgo(r.timestamp)} · Faixa ${fmt(r.min)}–${fmt(r.max)}`,
      linkTo: '/sensores',
    }
  })

  const devAtivos = devices ? devices.filter((d) => d.active).length : 0
  const devInativos = devices ? devices.filter((d) => !d.active).length : 0
  const senAtivos = sensors ? sensors.filter((s) => s.sensorStatus).length : 0
  const senInativos = sensors ? sensors.filter((s) => !s.sensorStatus).length : 0
  const actAtivos = actuators ? actuators.filter((a) => a.actuatorStatus).length : 0
  const actInativos = actuators ? actuators.filter((a) => !a.actuatorStatus).length : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-5 py-5">
          <div className="flex items-center gap-2">
            <Router size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Dispositivos</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            {loading ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : devices ? (
              <p className="text-sm">
                <span className="text-green-500 font-semibold">{devAtivos} ativos</span>
                <span className="text-gray-400"> · </span>
                <span className="text-red-500 font-semibold">{devInativos} inativos</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nenhum dispositivo registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-5 py-5">
          <div className="flex items-center gap-2">
            <SatelliteDish size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Sensores</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            {loading ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : sensors ? (
              <p className="text-sm">
                <span className="text-green-500 font-semibold">{senAtivos} ativos</span>
                <span className="text-gray-400"> · </span>
                <span className="text-red-500 font-semibold">{senInativos} inativos</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nenhum sensor registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-5 py-5">
          <div className="flex items-center gap-2">
            <ToggleRight size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Atuadores</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            {loading ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : actuators ? (
              <p className="text-sm">
                <span className="text-green-500 font-semibold">{actAtivos} ativos</span>
                <span className="text-gray-400"> · </span>
                <span className="text-red-500 font-semibold">{actInativos} inativos</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nenhum atuador registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-5 py-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Alertas</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            {loading ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : sensoresAtencao.length > 0 ? (
              <p className="text-sm">
                <span className="text-red-500 font-semibold">{sensoresAtencao.length} sensores em atenção</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Sem alertas no momento</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoldPanel
          title="Sensores em Atenção"
          icon={<Info size={18} className="text-white" />}
          actionLabel="Ver todos"
          onAction={() => navigate('/sensores')}
        >
          {sensoresAtencao.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {sensoresAtencao.map((sensor, i) => (
                <SensorBar key={i} sensor={sensor} sensorName={sensorNameMap[sensor.sensorId]} sensorData={sensorDataMap[sensor.sensorId]} onClick={() => navigate(`/leituras?sensorId=${sensor.sensorId}`)} />
              ))}
            </div>
          ) : (
            <EmptyMessage text="Nenhum sensor em atenção no momento" />
          )}
        </GoldPanel>

        <GoldPanel
          title="Alertas Recentes"
          actionLabel="Ver todos"
        >
          {alertas.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {alertas.map((alert, i) => (
                <AlertRow
                  key={i}
                  alert={alert}
                  onClick={() => navigate(alert.linkTo)}
                />
              ))}
            </div>
          ) : (
            <EmptyMessage text="Nenhum alerta recente" />
          )}
        </GoldPanel>
      </div>

      {alertPlots.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alertPlots.map((plot, i) => {
            const chartData = formatPlotForChart(plot.data)
            if (!chartData) return null

            const sensorLabel = sensorNameMap[plot.sensorId] || plot.sensorId.slice(0, 8) + '...'

            return (
              <DashboardChart
                key={i}
                title={`${sensorLabel} — 7 dias`}
                data={chartData}
                height={220}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
