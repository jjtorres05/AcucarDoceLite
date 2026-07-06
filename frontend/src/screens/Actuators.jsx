import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowUpDown, Edit, Power, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewActuatorModal from '../components/NewActuatorModal'
import EditActuatorModal from '../components/EditActuatorModal'
import { getActuators, deleteActuator, updateActuator } from '../services/actuators'
import { isAdmin } from '../services/auth'

const baseColumns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'device', label: 'Dispositivo' },
  { key: 'sensor', label: 'Sensor de controle' },
  { key: 'status', label: 'Status' },
]

export default function Actuators() {
  const [actuators, setActuators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const admin = isAdmin()

  const fetchActuators = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getActuators()
      setActuators(data)
    } catch (err) {
      setError('Erro ao carregar atuadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActuators()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este atuador?')) return
    try {
      await deleteActuator(id)
      fetchActuators()
    } catch (err) {
      setError('Erro ao excluir atuador')
    }
  }

  const handleToggle = async (actuator) => {
    try {
      await updateActuator(actuator.actuatorId, { active: !actuator.actuatorStatus })
      fetchActuators()
    } catch (err) {
      setError('Erro ao alterar status do atuador')
    }
  }

  const filtered = actuators.filter((a) =>
    a.actuatorName.toLowerCase().includes(search.toLowerCase())
  )

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
            placeholder="Procure Um Atuador Pelo Nome"
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
            Criar Atuador
          </Button>
        )}
      </div>

      <DataTable columns={admin ? [...baseColumns, { key: 'actions', label: 'Ações', center: true }] : baseColumns}>
        {filtered.map((actuator) => (
          <DataRow key={actuator.actuatorId}>
            <DataCell>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${actuator.actuatorStatus ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div>
                  <p className="font-medium text-navy-900 text-sm">{actuator.actuatorName}</p>
                  <p className="text-xs text-gray-400">{actuator.actuatorModel}</p>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <p className="font-medium text-navy-900 text-sm">{actuator.machineName}</p>
              <p className="text-xs text-gray-400">{actuator.machineModel}</p>
            </DataCell>
            <DataCell>
              {actuator.sensorName ? (
                <div>
                  <p className="text-sm text-navy-900">{actuator.sensorName}</p>
                  <p className="text-xs text-gray-400">{actuator.sensorModel}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sem sensor</p>
              )}
            </DataCell>
            <DataCell>
              <StatusBadge status={actuator.actuatorStatus ? 'Ativo' : 'Inativo'} />
            </DataCell>
            {admin && (
              <DataCell center>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(actuator)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="danger" size="icon" title="Ligar/Desligar" onClick={() => handleToggle(actuator)}>
                    <Power size={16} />
                  </Button>
                  <Button variant="danger" size="icon" title="Excluir" onClick={() => handleDelete(actuator.actuatorId)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </DataCell>
            )}
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={Math.ceil(filtered.length / 5) || 1} current={page} onPageChange={setPage} />

      {showModal && <NewActuatorModal onClose={() => setShowModal(false)} onCreated={fetchActuators} />}
      {editing && <EditActuatorModal actuator={editing} onClose={() => setEditing(null)} onUpdated={fetchActuators} />}
    </div>
  )
}
