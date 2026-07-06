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
import LineChart from '../components/LineChart'
import { getMachines } from '../services/machines'
import { getSensors } from '../services/sensors'
import { getActuators } from '../services/actuators'
import { getDashboardReadings, getPlotData } from '../services/registry'

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
  if (!reading.range) return 'warning'
  const name = reading.range.name?.toLowerCase() || ''
  if (name === 'normal') return 'ok'
  if (name.includes('crit') || name.includes('danger') || name.includes('perigo')) return 'critical'
  return 'warning'
}

function SensorBar({ sensor, onClick }) {
  const pct = sensor.max > sensor.min
    ? Math.min(Math.max(((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100, 0), 100)
    : 50
  const severity = getSeverity(sensor)
  const barColor = severity === 'critical' ? '#ef4444' : '#d97706'

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
        severity === 'critical' ? 'bg-red-500' : 'bg-amber-600'
      }`} />
      <div className="min-w-[140px]">
        <p className="text-sm font-semibold text-navy-900">{sensor.sensorId.slice(0, 8)}...</p>
        <p className="text-xs text-gray-400">{sensor.range?.name || 'Sem faixa'}</p>
      </div>
      <div className="flex-1 mx-2">
        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
          <span>{sensor.value} / max {sensor.max}</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(sensor.timestamp)}</p>
      </div>
      <span className={`text-2xl font-bold shrink-0 ${
        severity === 'critical' ? 'text-red-500' : 'text-amber-600'
      }`}>
        {sensor.value}
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.allSettled([
        getMachines(),
        getSensors(),
        getActuators(),
        getDashboardReadings(),
      ])
      if (results[0].status === 'fulfilled') setDevices(results[0].value)
      if (results[1].status === 'fulfilled') setSensors(results[1].value)
      if (results[2].status === 'fulfilled') setActuators(results[2].value)
      if (results[3].status === 'fulfilled' && results[3].value) setDashboardReadings(results[3].value)
      setLoading(false)
    }
    fetchData()
  }, [])

  const sensoresAtencao = dashboardReadings.filter((r) => {
    const severity = getSeverity(r)
    return severity !== 'ok'
  })

  const alertas = sensoresAtencao.map((r) => {
    const severity = getSeverity(r)
    return {
      icon: severity === 'critical' ? 'critical' : 'warning',
      message: `Sensor ${r.sensorId.slice(0, 8)}... — valor ${r.value} (${r.range?.name || 'fora de faixa'})`,
      detail: `${timeAgo(r.timestamp)} · Faixa ${r.min}–${r.max}`,
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
      {/* Stat Cards */}
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

      {/* Sensores em Atenção + Alertas Recentes */}
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
                <SensorBar key={i} sensor={sensor} onClick={() => navigate('/sensores')} />
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
    </div>
  )
}
