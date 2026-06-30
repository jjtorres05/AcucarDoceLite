import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowUpDown, Eye, Edit, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewDeviceModal from '../components/NewDeviceModal'
import { getMachines, deleteMachine } from '../services/machines'

const columns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'sensors', label: 'Sensores' },
  { key: 'actuators', label: 'Atuadores' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Ações', center: true },
]

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const data = await getMachines()
      setDevices(data)
    } catch (err) {
      setError('Erro ao carregar dispositivos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return
    try {
      await deleteMachine(id)
      fetchDevices()
    } catch (err) {
      setError('Erro ao excluir dispositivo')
    }
  }

  const filtered = devices.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-center py-8 text-gray-500">Carregando...</p>
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>

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
                <span className={`w-2 h-2 rounded-full ${device.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-medium text-navy-900 text-sm">{device.nome}</p>
                  <p className="text-xs text-gray-400">{device.modelo}</p>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">
                {(device.numberActiveSensors || 0) + (device.numberInactiveSensor || 0)} sensores
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {device.numberActiveSensors || 0} ativos
              </p>
            </DataCell>
            <DataCell>
              <p className="text-sm text-navy-900">
                {(device.numberActiveActuator || 0) + (device.numberInactiveActuator || 0)} atuadores
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {device.numberActiveActuator || 0} ativos
              </p>
            </DataCell>
            <DataCell>
              <StatusBadge status={device.active ? 'Ativo' : 'Inativo'} />
            </DataCell>
            <DataCell center>
              <div className="flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" title="Ver"><Eye size={16} /></Button>
                <Button variant="ghost" size="icon" title="Editar"><Edit size={16} /></Button>
                <Button variant="danger" size="icon" title="Excluir" onClick={() => handleDelete(device.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={Math.ceil(filtered.length / 5) || 1} current={page} onPageChange={setPage} />

      {showModal && <NewDeviceModal onClose={() => setShowModal(false)} onCreated={fetchDevices} />}
    </div>
  )
}
