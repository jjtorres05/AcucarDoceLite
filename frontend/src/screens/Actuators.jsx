import { useState, useEffect, useRef } from 'react'
import { Plus, Filter, ArrowUpDown, Edit, Power, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewActuatorModal from '../components/NewActuatorModal'
import EditActuatorModal from '../components/EditActuatorModal'
import ConfirmModal from '../components/ConfirmModal'
import { getActuators, deleteActuator, updateActuator } from '../services/actuators'
import DropdownPanel from '../components/DropdownPanel'
import FilterOption from '../components/FilterOption'
import { isAdmin } from '../services/auth'

const PER_PAGE = 5

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
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDevice, setFilterDevice] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
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
    try {
      await deleteActuator(id)
      setConfirmDelete(null)
      fetchActuators()
    } catch (err) {
      setError('Erro ao excluir atuador')
      setConfirmDelete(null)
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

  const deviceNames = [...new Set(actuators.map(a => a.machineName).filter(Boolean))]

  let result = actuators.filter((a) =>
    a.actuatorName.toLowerCase().includes(search.toLowerCase())
  )

  if (filterStatus === 'active') result = result.filter(a => a.actuatorStatus)
  else if (filterStatus === 'inactive') result = result.filter(a => !a.actuatorStatus)

  if (filterDevice !== 'all') result = result.filter(a => a.machineName === filterDevice)

  result.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') cmp = a.actuatorName.localeCompare(b.actuatorName)
    else if (sortBy === 'status') cmp = (a.actuatorStatus === b.actuatorStatus ? 0 : a.actuatorStatus ? -1 : 1)
    else if (sortBy === 'device') cmp = (a.machineName || '').localeCompare(b.machineName || '')
    else if (sortBy === 'sensor') cmp = (a.sensorName || '').localeCompare(b.sensorName || '')
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(result.length / PER_PAGE) || 1
  if (page > totalPages) setPage(1)
  const paginated = result.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleFilterChange = (type, value) => {
    if (type === 'status') setFilterStatus(value)
    else setFilterDevice(value)
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
            placeholder="Procure Um Atuador Pelo Nome"
            className="w-80"
          />
          <div className="relative" ref={filterRef}>
            <Button variant="gold" size="sm" onClick={() => { setShowFilter(!showFilter); setShowSort(false) }}>
              <Filter size={14} />
              Filtro
              {(filterStatus !== 'all' || filterDevice !== 'all') && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Button>
            <DropdownPanel open={showFilter}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Status</p>
              <FilterOption label="Todos" active={filterStatus === 'all'} onClick={() => handleFilterChange('status', 'all')} />
              <FilterOption label="Ativos" active={filterStatus === 'active'} onClick={() => handleFilterChange('status', 'active')} />
              <FilterOption label="Inativos" active={filterStatus === 'inactive'} onClick={() => handleFilterChange('status', 'inactive')} />
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
              {(filterStatus !== 'all' || filterDevice !== 'all') && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('all'); setFilterDevice('all'); setPage(1) }}
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
              <FilterOption label={`Status ${sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'status'} onClick={() => handleSortChange('status')} />
              <FilterOption label={`Dispositivo ${sortBy === 'device' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'device'} onClick={() => handleSortChange('device')} />
              <FilterOption label={`Sensor ${sortBy === 'sensor' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'sensor'} onClick={() => handleSortChange('sensor')} />
            </DropdownPanel>
          </div>
        </div>
        {admin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Criar Atuador
          </Button>
        )}
      </div>

      <DataTable columns={admin ? [...baseColumns, { key: 'actions', label: 'Ações', center: true }] : baseColumns}>
        {paginated.map((actuator) => (
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
                  <Button variant="danger" size="icon" title="Excluir" onClick={() => setConfirmDelete(actuator.actuatorId)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </DataCell>
            )}
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={totalPages} current={page} onPageChange={setPage} />

      {showModal && <NewActuatorModal onClose={() => setShowModal(false)} onCreated={fetchActuators} />}
      {editing && <EditActuatorModal actuator={editing} onClose={() => setEditing(null)} onUpdated={fetchActuators} />}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir atuador"
          message="Tem certeza que deseja excluir este atuador? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
