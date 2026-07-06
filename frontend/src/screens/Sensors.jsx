import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowUpDown, Eye, Edit, Power, Trash2, X, Activity, CircleCheck, CircleAlert, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import StatCard from '../components/StatCard'
import SensorTypeBadge from '../components/SensorTypeBadge'
import ReadingBar from '../components/ReadingBar'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewSensorModal from '../components/NewSensorModal'
import EditSensorModal from '../components/EditSensorModal'
import ViewSensorModal from '../components/ViewSensorModal'
import { getSensors, deleteSensor, updateSensor } from '../services/sensors'
import { getDashboardReadings } from '../services/registry'
import { isAdmin } from '../services/auth'

const baseColumns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'actuators', label: 'Atuadores' },
  { key: 'type', label: 'Tipo' },
  { key: 'device', label: 'Dispositivo' },
  { key: 'status', label: 'Status' },
  { key: 'reading', label: 'Leitura Atual' },
  { key: 'actions', label: 'Ações', center: true },
]

function ActuatorDots({ active, inactive }) {
  const dots = []
  for (let i = 0; i < active; i++) dots.push('bg-green-500')
  for (let i = 0; i < inactive; i++) dots.push('bg-amber-500')

  return (
    <div className="flex items-center gap-1 mt-0.5">
      {dots.map((color, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${color}`} />
      ))}
    </div>
  )
}

function getMinutesAgo(timestamp) {
  if (!timestamp) return undefined
  return Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
}

export default function Sensors() {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [readings, setReadings] = useState({})
  const admin = isAdmin()

  const fetchSensors = async () => {
    try {
      setLoading(true)
      setError('')
      const [sensorsData, readingsData] = await Promise.allSettled([
        getSensors(),
        getDashboardReadings(),
      ])
      if (sensorsData.status === 'fulfilled') setSensors(sensorsData.value)
      else setError('Erro ao carregar sensores')

      if (readingsData.status === 'fulfilled' && readingsData.value) {
        const map = {}
        for (const r of readingsData.value) {
          map[r.sensorId] = r
        }
        setReadings(map)
      }
    } catch (err) {
      setError('Erro ao carregar sensores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensors()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este sensor?')) return
    try {
      await deleteSensor(id)
      fetchSensors()
    } catch (err) {
      setError('Erro ao excluir sensor')
    }
  }

  const handleToggle = async (sensor) => {
    try {
      await updateSensor(sensor.sensorId, { active: !sensor.sensorStatus })
      fetchSensors()
    } catch (err) {
      setError('Erro ao alterar status do sensor')
    }
  }

  const filtered = sensors.filter((s) =>
    s.sensorName.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive = sensors.filter(s => s.sensorStatus).length
  const totalInactive = sensors.filter(s => !s.sensorStatus).length
  const totalAttention = Object.values(readings).filter((r) => {
    if (!r.range) return true
    const name = r.range.name?.toLowerCase() || ''
    return name !== 'normal'
  }).length

  if (loading) return <p className="text-center py-8 text-gray-500">Carregando...</p>
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Input
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure Um Sensor Pelo Nome"
            className="w-80"
          />
          <Button variant="gold" size="sm" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={14} />
            Filtro
            {showFilter && <X size={12} />}
          </Button>
          <Button variant="gold" size="sm" onClick={() => setShowSort(!showSort)}>
            <ArrowUpDown size={14} />
            Ordenar Por
            {showSort && <X size={12} />}
          </Button>
        </div>
        {admin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Criar Sensor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Activity size={24} className="text-navy-900" />}
          label="Total"
          value={sensors.length}
        />
        <StatCard
          icon={<CircleCheck size={24} className="text-green-500" />}
          label="Ativos"
          value={totalActive}
          color="text-green-600"
        />
        <StatCard
          icon={<CircleAlert size={24} className="text-orange-500" />}
          label="Inativos"
          value={totalInactive}
          color="text-orange-600"
        />
        <StatCard
          icon={<AlertTriangle size={24} className="text-red-500" />}
          label="Em atenção"
          value={totalAttention}
          color="text-red-600"
        />
      </div>

      <DataTable columns={baseColumns}>
        {filtered.map((sensor) => {
          const reading = readings[sensor.sensorId]
          return (
            <DataRow key={sensor.sensorId}>
              <DataCell>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sensor.sensorStatus ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-medium text-navy-900 text-sm">{sensor.sensorName}</p>
                    <p className="text-xs text-gray-400">{sensor.sensorModel}</p>
                  </div>
                </div>
              </DataCell>
              <DataCell>
                <p className="text-sm text-navy-900">
                  {(sensor.numberActiveActuator || 0) + (sensor.numberInactiveActuator || 0)} atuadores
                </p>
                <ActuatorDots
                  active={sensor.numberActiveActuator || 0}
                  inactive={sensor.numberInactiveActuator || 0}
                />
              </DataCell>
              <DataCell>
                {sensor.sensorType ? (
                  <SensorTypeBadge type={sensor.sensorType} />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </DataCell>
              <DataCell>
                <p className="font-medium text-navy-900 text-sm">{sensor.machineName}</p>
                <p className="text-xs text-gray-400">{sensor.machineModel}</p>
              </DataCell>
              <DataCell>
                <StatusBadge status={sensor.sensorStatus ? 'Ativo' : 'Inativo'} />
              </DataCell>
              <DataCell>
                {reading ? (
                  <ReadingBar
                    value={reading.value}
                    min={reading.min}
                    max={reading.max}
                    unit={sensor.unit || ''}
                    ago={getMinutesAgo(reading.timestamp)}
                  />
                ) : (
                  <span className="text-xs text-gray-400">Sem leitura</span>
                )}
              </DataCell>
              <DataCell center>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setViewing(sensor)}>
                    <Eye size={16} />
                  </Button>
                  {admin && (
                    <>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(sensor)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="danger" size="icon" title="Ligar/Desligar" onClick={() => handleToggle(sensor)}>
                        <Power size={16} />
                      </Button>
                      <Button variant="danger" size="icon" title="Excluir" onClick={() => handleDelete(sensor.sensorId)}>
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </DataCell>
            </DataRow>
          )
        })}
      </DataTable>

      <Pagination total={Math.ceil(filtered.length / 5) || 1} current={page} onPageChange={setPage} />

      {showModal && <NewSensorModal onClose={() => setShowModal(false)} onCreated={fetchSensors} />}
      {editing && <EditSensorModal sensor={editing} onClose={() => setEditing(null)} onUpdated={fetchSensors} />}
      {viewing && <ViewSensorModal sensor={viewing} reading={readings[viewing.sensorId]} onClose={() => setViewing(null)} />}
    </div>
  )
}
