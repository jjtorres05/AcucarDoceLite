import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
import ConfirmModal from '../components/ConfirmModal'
import { getSensors, deleteSensor, updateSensor } from '../services/sensors'
import { getDashboardReadings } from '../services/registry'
import DropdownPanel from '../components/DropdownPanel'
import FilterOption from '../components/FilterOption'
import { isAdmin } from '../services/auth'

const PER_PAGE = 5

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
  const navigate = useNavigate()
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterDevice, setFilterDevice] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [readings, setReadings] = useState({})
  const [rawReadings, setRawReadings] = useState([])
  const admin = isAdmin()
  const filterRef = useRef(null)
  const sortRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false)
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
        setRawReadings(readingsData.value)
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
    try {
      await deleteSensor(id)
      setConfirmDelete(null)
      fetchSensors()
    } catch (err) {
      setError('Erro ao excluir sensor')
      setConfirmDelete(null)
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

  const sensorTypes = [...new Set(sensors.map(s => s.sensorType).filter(Boolean))]
  const deviceNames = [...new Set(sensors.map(s => s.machineName).filter(Boolean))]

  let result = sensors.filter((s) =>
    s.sensorName.toLowerCase().includes(search.toLowerCase())
  )

  if (filterStatus === 'active') result = result.filter(s => s.sensorStatus)
  else if (filterStatus === 'inactive') result = result.filter(s => !s.sensorStatus)

  if (filterType !== 'all') result = result.filter(s => s.sensorType === filterType)
  if (filterDevice !== 'all') result = result.filter(s => s.machineName === filterDevice)

  result.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') cmp = a.sensorName.localeCompare(b.sensorName)
    else if (sortBy === 'type') cmp = (a.sensorType || '').localeCompare(b.sensorType || '')
    else if (sortBy === 'status') cmp = (a.sensorStatus === b.sensorStatus ? 0 : a.sensorStatus ? -1 : 1)
    else if (sortBy === 'device') cmp = (a.machineName || '').localeCompare(b.machineName || '')
    else if (sortBy === 'actuators') cmp = ((a.numberActiveActuator || 0) + (a.numberInactiveActuator || 0)) - ((b.numberActiveActuator || 0) + (b.numberInactiveActuator || 0))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(result.length / PER_PAGE) || 1
  if (page > totalPages) setPage(1)
  const paginated = result.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const totalActive = sensors.filter(s => s.sensorStatus).length
  const totalInactive = sensors.filter(s => !s.sensorStatus).length
  const totalAttention = rawReadings.filter((r) => {
    if (!r.range) return true
    const name = r.range.name?.toLowerCase() || ''
    return name !== 'normal'
  }).length

  const handleFilterChange = (filterKey, value) => {
    if (filterKey === 'status') setFilterStatus(value)
    else if (filterKey === 'type') setFilterType(value)
    else if (filterKey === 'device') setFilterDevice(value)
    setPage(1)
  }

  const handleSortChange = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
    setShowSort(false)
    setPage(1)
  }

  if (loading) return <p className="text-center py-8 text-gray-500">Carregando...</p>
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Input
            icon="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Procure Um Sensor Pelo Nome"
            className="w-80"
          />
          <div className="relative" ref={filterRef}>
            <Button variant="gold" size="sm" onClick={() => { setShowFilter(!showFilter); setShowSort(false) }}>
              <Filter size={14} />
              Filtro
              {(filterStatus !== 'all' || filterType !== 'all' || filterDevice !== 'all') && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Button>
            <DropdownPanel open={showFilter}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Status</p>
              <FilterOption label="Todos" active={filterStatus === 'all'} onClick={() => handleFilterChange('status', 'all')} />
              <FilterOption label="Ativos" active={filterStatus === 'active'} onClick={() => handleFilterChange('status', 'active')} />
              <FilterOption label="Inativos" active={filterStatus === 'inactive'} onClick={() => handleFilterChange('status', 'inactive')} />
              {sensorTypes.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Tipo</p>
                  <FilterOption label="Todos" active={filterType === 'all'} onClick={() => handleFilterChange('type', 'all')} />
                  {sensorTypes.map(t => (
                    <FilterOption key={t} label={t} active={filterType === t} onClick={() => handleFilterChange('type', t)} />
                  ))}
                </>
              )}
              {deviceNames.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Dispositivo</p>
                  <FilterOption label="Todos" active={filterDevice === 'all'} onClick={() => handleFilterChange('device', 'all')} />
                  {deviceNames.map(d => (
                    <FilterOption key={d} label={d} active={filterDevice === d} onClick={() => handleFilterChange('device', d)} />
                  ))}
                </>
              )}
              {(filterStatus !== 'all' || filterType !== 'all' || filterDevice !== 'all') && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('all'); setFilterType('all'); setFilterDevice('all'); setPage(1) }}
                    className="w-full text-center text-xs text-red-500 hover:text-red-600 py-1 cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </DropdownPanel>
          </div>
          <div className="relative" ref={sortRef}>
            <Button variant="gold" size="sm" onClick={() => { setShowSort(!showSort); setShowFilter(false) }}>
              <ArrowUpDown size={14} />
              Ordenar Por
            </Button>
            <DropdownPanel open={showSort}>
              <FilterOption label={`Nome ${sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'name'} onClick={() => handleSortChange('name')} />
              <FilterOption label={`Tipo ${sortBy === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'type'} onClick={() => handleSortChange('type')} />
              <FilterOption label={`Status ${sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'status'} onClick={() => handleSortChange('status')} />
              <FilterOption label={`Dispositivo ${sortBy === 'device' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'device'} onClick={() => handleSortChange('device')} />
              <FilterOption label={`Atuadores ${sortBy === 'actuators' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'actuators'} onClick={() => handleSortChange('actuators')} />
            </DropdownPanel>
          </div>
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
        {paginated.map((sensor) => {
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
                    activationRanges={sensor.activationRanges}
                  />
                ) : sensor.activationRanges?.length > 0 ? (
                  <ReadingBar
                    min={Math.min(...sensor.activationRanges.map(r => r.lowerBound))}
                    max={Math.max(...sensor.activationRanges.map(r => r.upperBound))}
                    unit={sensor.unit || ''}
                    activationRanges={sensor.activationRanges}
                  />
                ) : (
                  <ReadingBar unit={sensor.unit || ''} />
                )}
              </DataCell>
              <DataCell center>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" title="Leituras" onClick={() => navigate(`/leituras?sensorId=${sensor.sensorId}`)}>
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
                      <Button variant="danger" size="icon" title="Excluir" onClick={() => setConfirmDelete(sensor.sensorId)}>
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

      <Pagination total={totalPages} current={page} onPageChange={setPage} />

      {showModal && <NewSensorModal onClose={() => setShowModal(false)} onCreated={fetchSensors} />}
      {editing && <EditSensorModal sensor={editing} onClose={() => setEditing(null)} onUpdated={fetchSensors} />}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir sensor"
          message="Tem certeza que deseja excluir este sensor? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
