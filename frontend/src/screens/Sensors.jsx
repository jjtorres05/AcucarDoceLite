import { useState } from 'react'
import { Plus, Filter, ArrowUpDown, Eye, Edit, Power, Trash2, X, Activity, CircleCheck, CircleAlert, TriangleAlert } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import StatCard from '../components/StatCard'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'

const sensors = [
  { id: 1, name: 'Sensor temperatura - Sala B', model: 'ESPN-32', actuators: { total: 4, active: 4 }, status: 'Ativo' },
  { id: 2, name: 'Sensor de luz - cultivo arroz', model: 'ESPN-33', actuators: { total: 4, active: 1, warning: 2 }, status: 'Ativo' },
  { id: 3, name: 'Sensor PH - cultivo batata', model: 'ESPN-34', actuators: { total: 5, warning: 2, critical: 3 }, status: 'Inativo' },
  { id: 4, name: 'Sensor Humidade - Armazem A', model: 'ESPN-35', actuators: { total: 2, offline: 2 }, status: 'Ativo' },
]

const columns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'actuators', label: 'Atuadores' },
]

function ActuatorDots({ actuators }) {
  const dots = []
  if (actuators.active) for (let i = 0; i < actuators.active; i++) dots.push('green')
  if (actuators.warning) for (let i = 0; i < actuators.warning; i++) dots.push('orange')
  if (actuators.critical) for (let i = 0; i < actuators.critical; i++) dots.push('red')
  if (actuators.offline) for (let i = 0; i < actuators.offline; i++) dots.push('gray')

  const colorMap = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  }

  return (
    <div className="flex items-center gap-1 mt-0.5">
      {dots.map((color, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${colorMap[color]}`} />
      ))}
    </div>
  )
}

export default function Sensors() {
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = sensors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Input
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure Um Dispositivo Pelo Nome"
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
        <Button>
          <Plus size={16} />
          Criar Sensor
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <StatCard
          icon={<Activity size={24} className="text-navy-900" />}
          label="Total"
          value="20"
        />
        <StatCard
          icon={<CircleCheck size={24} className="text-green-500" />}
          label="Ativos"
          value="18"
          color="text-green-600"
        />
        <StatCard
          icon={<CircleAlert size={24} className="text-orange-500" />}
          label="Inativos"
          value="2"
          color="text-orange-600"
        />
        <StatCard
          icon={<TriangleAlert size={24} className="text-red-500" />}
          label="Em atencao"
          value="1"
          color="text-red-600"
        />
      </div>

      <DataTable columns={columns}>
        {filtered.map((sensor) => (
          <DataRow key={sensor.id}>
            <DataCell>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  sensor.status === 'Ativo' ? 'bg-green-500' :
                  sensor.actuators.critical ? 'bg-red-500' :
                  sensor.actuators.warning ? 'bg-orange-500' :
                  'bg-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-navy-900 text-sm">{sensor.name}</p>
                  <p className="text-xs text-gray-400">{sensor.model}</p>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">{sensor.actuators.total} atuadores</p>
              <ActuatorDots actuators={sensor.actuators} />
            </DataCell>
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={3} current={page} onPageChange={setPage} />
    </div>
  )
}
