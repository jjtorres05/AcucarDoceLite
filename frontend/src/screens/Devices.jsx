import { useState } from 'react'
import { Plus, Filter, ArrowUpDown, Eye, Edit, Power, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewDeviceModal from '../components/NewDeviceModal'

const devices = [
  { id: 1, name: 'Caldeira-A', model: 'ESPN-32', sensors: { total: 4, normal: 4 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
  { id: 2, name: 'Armazem-A', model: 'ESPN-33', sensors: { total: 3, alerts: [1, 1, 1] }, actuators: { total: 1, active: 1 }, status: 'Ativo' },
  { id: 3, name: 'Caldeira-B', model: 'ESPN-34', sensors: { total: 8, critical: 2, warning: 1, normal: 5 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
  { id: 4, name: 'Armazem-B', model: 'ESPN-35', sensors: { total: 2, offline: 2 }, actuators: { total: 1, active: 1 }, status: 'Inativo' },
  { id: 5, name: 'Caldeia-C', model: 'ESPN-30', sensors: { total: 4, normal: 4 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
]

const columns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'sensors', label: 'Sensores' },
  { key: 'actuators', label: 'Atuadores' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Acoes', center: true },
]

function SensorDots({ device }) {
  const dots = []
  if (device.sensors.critical) for (let i = 0; i < device.sensors.critical; i++) dots.push('red')
  if (device.sensors.warning) for (let i = 0; i < device.sensors.warning; i++) dots.push('orange')
  if (device.sensors.normal) for (let i = 0; i < device.sensors.normal; i++) dots.push('green')
  if (device.sensors.offline) for (let i = 0; i < device.sensors.offline; i++) dots.push('gray')
  if (device.sensors.alerts) device.sensors.alerts.forEach(() => dots.push('yellow'))

  const colorMap = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-400',
  }

  return (
    <div className="flex items-center gap-1 mt-0.5">
      {dots.slice(0, 6).map((color, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${colorMap[color]}`} />
      ))}
      {dots.length > 6 && <span className="text-xs text-gray-400">+{dots.length - 6}</span>}
    </div>
  )
}

export default function Devices() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Input
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure Um Dispositivo Pelo Nome"
            className="w-72"
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
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Criar Dispositivo
        </Button>
      </div>

      <DataTable columns={columns}>
        {filtered.map((device) => (
          <DataRow key={device.id}>
            <DataCell>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${device.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-medium text-navy-900 text-sm">{device.name}</p>
                  <p className="text-xs text-gray-400">{device.model}</p>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">{device.sensors.total} sensores</p>
              <SensorDots device={device} />
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">{device.actuators.total} atuador{device.actuators.total !== 1 ? 'es' : ''}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {device.actuators.active ? `${device.actuators.active} ativo` : ''}
                {device.actuators.offline ? `${device.actuators.offline} offline` : ''}
              </p>
            </DataCell>
            <DataCell>
              <StatusBadge status={device.status} />
            </DataCell>
            <DataCell center>
              <div className="flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" title="Ver"><Eye size={16} /></Button>
                <Button variant="ghost" size="icon" title="Editar"><Edit size={16} /></Button>
                <Button variant="danger" size="icon" title="Ligar/Desligar"><Power size={16} /></Button>
                <Button variant="danger" size="icon" title="Excluir"><Trash2 size={16} /></Button>
              </div>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={3} current={page} onPageChange={setPage} />

      {showModal && <NewDeviceModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
