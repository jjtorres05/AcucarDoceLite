import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SatelliteDish, ChevronDown, Search, ToggleRight } from 'lucide-react'
import LineChart from '../components/LineChart'
import SensorTypeBadge from '../components/SensorTypeBadge'
import { getSensors } from '../services/sensors'
import { getActuators } from '../services/actuators'
import { getSensorDashboard } from '../services/registry'

function getSevenDaysRange() {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function formatChartData(sensorData) {
  if (!sensorData || sensorData.length === 0) return null
  const raw = sensorData.map((point) => {
    const d = new Date(point.timestamp)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const hour = d.getHours().toString().padStart(2, '0')
    return {
      label: `${day}/${month} ${hour}h`,
      avg: Math.round(point.avgRecord * 100) / 100,
      min: Math.round(point.minRecord * 100) / 100,
      max: Math.round(point.maxRecord * 100) / 100,
      median: Math.round(point.medianRecord * 100) / 100,
    }
  })
  const step = Math.max(1, Math.floor(raw.length / 14))
  return raw.filter((_, i) => i % step === 0 || i === raw.length - 1)
}

function SensorSelector({ sensors, selectedId, onSelect }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = sensors.find((s) => s.sensorId === selectedId)
  const filtered = sensors.filter((s) =>
    s.sensorName.toLowerCase().includes(search.toLowerCase()) ||
    (s.sensorType || '').toLowerCase().includes(search.toLowerCase()) ||
    s.machineName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-left hover:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 transition cursor-pointer"
      >
        {selected ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
              <SatelliteDish size={16} className="text-gold-500" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-navy-900 truncate">{selected.sensorName}</p>
              <p className="text-xs text-gray-400 truncate">{selected.sensorType || 'Sem tipo'} · {selected.machineName}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Selecione um sensor...</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sensor..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum sensor encontrado</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.sensorId}
                  type="button"
                  onClick={() => { onSelect(s.sensorId); setOpen(false); setSearch('') }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition cursor-pointer ${
                    s.sensorId === selectedId ? 'bg-gold-50' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    s.sensorId === selectedId ? 'bg-gold-100' : 'bg-gray-100'
                  }`}>
                    <SatelliteDish size={14} className={s.sensorId === selectedId ? 'text-gold-500' : 'text-gray-400'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900 truncate">{s.sensorName}</p>
                    <p className="text-xs text-gray-400 truncate">{s.machineName} · {s.sensorModel}</p>
                  </div>
                  {s.sensorType && <SensorTypeBadge type={s.sensorType} />}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.sensorStatus ? 'bg-green-500' : 'bg-red-400'}`} />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Leituras() {
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get('sensorId') || ''

  const [sensors, setSensors] = useState([])
  const [selectedSensorId, setSelectedSensorId] = useState(preselectedId)
  const [chartData, setChartData] = useState(null)
  const [sensorInfo, setSensorInfo] = useState(null)
  const [actuators, setActuators] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPlot, setLoadingPlot] = useState(false)

  useEffect(() => {
    Promise.allSettled([getSensors(), getActuators()])
      .then(([sensorsRes, actuatorsRes]) => {
        if (sensorsRes.status === 'fulfilled') {
          setSensors(sensorsRes.value)
          if (!selectedSensorId && sensorsRes.value.length > 0) {
            setSelectedSensorId(sensorsRes.value[0].sensorId)
          }
        }
        if (actuatorsRes.status === 'fulfilled') setActuators(actuatorsRes.value)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedSensorId) return
    setLoadingPlot(true)
    setChartData(null)
    setSensorInfo(null)

    const { startDate, endDate } = getSevenDaysRange()

    getSensorDashboard(selectedSensorId, startDate, endDate)
      .then(({ sensorData, plotData }) => {
        setChartData(formatChartData(sensorData))
        setSensorInfo(plotData)
      })
      .catch(() => {
        setChartData(null)
        setSensorInfo(null)
      })
      .finally(() => setLoadingPlot(false))
  }, [selectedSensorId])

  const selectedSensor = sensors.find((s) => s.sensorId === selectedSensorId)

  const sensorName = sensorInfo?.name || selectedSensor?.sensorName
  const sensorModel = sensorInfo?.model || selectedSensor?.sensorModel
  const sensorType = sensorInfo?.sType || selectedSensor?.sensorType
  const sensorUnit = sensorInfo?.unit || selectedSensor?.sensorUnit || selectedSensor?.unit
  const sensorActive = sensorInfo?.active ?? selectedSensor?.sensorStatus
  const machineName = selectedSensor?.machineName
  const sensorActuators = actuators.filter(a => a.sensorName === sensorName)
  const ranges = sensorInfo?.activationRanges || selectedSensor?.activationRanges

  if (loading) return <p className="text-center py-8 text-gray-500">Carregando...</p>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Selecione o sensor</label>
        <SensorSelector sensors={sensors} selectedId={selectedSensorId} onSelect={setSelectedSensorId} />
      </div>

      {(selectedSensor || sensorInfo) && (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <SatelliteDish size={20} className="text-gold-500" />
            <h2 className="text-lg font-semibold text-navy-900">{sensorName}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              sensorActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {sensorActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Modelo</span>
              <p className="font-medium text-navy-900">{sensorModel || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Tipo</span>
              <p className="font-medium text-navy-900">{sensorType || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Unidade</span>
              <p className="font-medium text-navy-900">{sensorUnit || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Dispositivo</span>
              <p className="font-medium text-navy-900">{machineName || '—'}</p>
            </div>
          </div>

          {sensorActuators.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <ToggleRight size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Atuadores conectados ({sensorActuators.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sensorActuators.map((act) => (
                  <div key={act.actuatorId} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${act.actuatorStatus ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-sm text-navy-900 font-medium">{act.actuatorName}</span>
                    <span className="text-xs text-gray-400">{act.actuatorModel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ranges?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 mb-2 block">Faixas de ativação</span>
              <div className="flex flex-wrap gap-2">
                {ranges.map((r, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {r.name}: {Number(r.lowerBound).toFixed(2)} – {Number(r.upperBound).toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedSensorId && (
        loadingPlot ? (
          <p className="text-center py-8 text-gray-500">Carregando leituras...</p>
        ) : chartData ? (
          <LineChart
            title={`${sensorName || 'Sensor'} — Últimos 7 dias`}
            data={chartData}
            series={{
              avg: { color: '#d97706', label: 'Média' },
              max: { color: '#ef4444', label: 'Máximo' },
              min: { color: '#3b82f6', label: 'Mínimo' },
              median: { color: '#10b981', label: 'Mediana' },
            }}
            height={280}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 text-center">
            <p className="text-gray-400">Sem dados de leitura para este sensor nos últimos 7 dias</p>
          </div>
        )
      )}
    </div>
  )
}
