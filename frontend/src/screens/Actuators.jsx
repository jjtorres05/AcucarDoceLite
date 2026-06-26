import { useState } from 'react'
import { Plus, Filter, ArrowUpDown, Eye, Edit, Power, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import ActuatorTypeBadge from '../components/ActuatorTypeBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewActuatorModal from '../components/NewActuatorModal'

const actuators = [
  { id: 1, name: 'Válvula de água', type: 'Irrigador', device: 'Caldeira-A', model: 'ESPN-32', sensor: 'Humidade de cultivo', sensorCount: 2, status: 'Ativo' },
  { id: 2, name: 'Bomba de água', type: 'Motor', device: 'Armazém-A', model: 'ESPN-33', sensor: 'Armazenamento de água', sensorCount: null, status: 'Ativo' },
  { id: 3, name: 'Ventilador', type: 'Ventilador', device: 'Caldeira-B', model: 'ESPN-34', sensor: 'Temperatura de armazenamento', sensorCount: 2, status: 'Ativo' },
  { id: 4, name: 'Portão de entrada', type: 'Porta', device: 'Armazém-B', model: 'ESPN-35', sensor: 'Sensor de iluminação', sensorCount: null, status: 'Inativo' },
]

const columns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'type', label: 'Tipo' },
  { key: 'device', label: 'Dispositivos' },
  { key: 'sensor', label: 'Sensor de controle' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Ações', center: true },
]

export default function Actuators() {
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const filtered = actuators.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
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
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Criar Dispositivo
        </Button>
      </div>

      <DataTable columns={columns}>
        {filtered.map((actuator) => (
          <DataRow key={actuator.id}>
            <DataCell>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${actuator.status === 'Ativo' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <p className="font-medium text-navy-900 text-sm">{actuator.name}</p>
              </div>
            </DataCell>
            <DataCell>
              <ActuatorTypeBadge type={actuator.type} />
            </DataCell>
            <DataCell>
              <p className="font-medium text-navy-900 text-sm">{actuator.device}</p>
              <p className="text-xs text-gray-400">{actuator.model}</p>
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">{actuator.sensor}</p>
              {actuator.sensorCount && (
                <p className="text-xs text-gray-400">{actuator.sensorCount} ativos</p>
              )}
            </DataCell>
            <DataCell>
              <StatusBadge status={actuator.status} />
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

      {showModal && <NewActuatorModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
