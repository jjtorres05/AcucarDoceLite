import { useState, useEffect, useRef } from 'react'
import { Plus, Filter, ArrowUpDown, Edit, Power, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { DataTable, DataRow, DataCell } from '../components/DataTable'
import Pagination from '../components/Pagination'
import NewDeviceModal from '../components/NewDeviceModal'
import EditDeviceModal from '../components/EditDeviceModal'
import ConfirmModal from '../components/ConfirmModal'
import { getMachines, deleteMachine, updateMachine } from '../services/machines'
import { isAdmin } from '../services/auth'

const PER_PAGE = 5

const baseColumns = [
  { key: 'name', label: 'Nome / Modelo' },
  { key: 'sensors', label: 'Sensores' },
  { key: 'actuators', label: 'Atuadores' },
  { key: 'status', label: 'Status' },
]

function DropdownPanel({ open, children, refEl }) {
  if (!open) return null
  return (
    <div ref={refEl} className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20 min-w-[200px]">
      {children}
    </div>
  )
}

function FilterOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
        active ? 'bg-gold-50 text-gold-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
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

  const handleToggle = async (device) => {
    try {
      await updateMachine(device.id, { active: !device.active })
      fetchDevices()
    } catch (err) {
      setError('Erro ao alterar status do dispositivo')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMachine(id)
      setConfirmDelete(null)
      fetchDevices()
    } catch (err) {
      setError('Erro ao excluir dispositivo')
      setConfirmDelete(null)
    }
  }

  let result = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (filterStatus === 'active') result = result.filter(d => d.active)
  else if (filterStatus === 'inactive') result = result.filter(d => !d.active)

  result.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortBy === 'status') cmp = (a.active === b.active ? 0 : a.active ? -1 : 1)
    else if (sortBy === 'sensors') cmp = ((a.numberActiveSensors || 0) + (a.numberInactiveSensor || 0)) - ((b.numberActiveSensors || 0) + (b.numberInactiveSensor || 0))
    else if (sortBy === 'actuators') cmp = ((a.numberActiveActuator || 0) + (a.numberInactiveActuator || 0)) - ((b.numberActiveActuator || 0) + (b.numberInactiveActuator || 0))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(result.length / PER_PAGE) || 1
  if (page > totalPages) setPage(1)
  const paginated = result.slice((page - 1) * PER_PAGE, page * PER_PAGE)

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Input
            icon="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Procure Um Dispositivo Pelo Nome"
            className="w-72"
          />
          <div className="relative" ref={filterRef}>
            <Button variant="gold" size="sm" onClick={() => { setShowFilter(!showFilter); setShowSort(false) }}>
              <Filter size={14} />
              Filtro
              {filterStatus !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </Button>
            <DropdownPanel open={showFilter}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Status</p>
              <FilterOption label="Todos" active={filterStatus === 'all'} onClick={() => { setFilterStatus('all'); setPage(1) }} />
              <FilterOption label="Ativos" active={filterStatus === 'active'} onClick={() => { setFilterStatus('active'); setPage(1) }} />
              <FilterOption label="Inativos" active={filterStatus === 'inactive'} onClick={() => { setFilterStatus('inactive'); setPage(1) }} />
              {filterStatus !== 'all' && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('all'); setPage(1) }}
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
              <FilterOption label={`Sensores ${sortBy === 'sensors' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'sensors'} onClick={() => handleSortChange('sensors')} />
              <FilterOption label={`Atuadores ${sortBy === 'actuators' ? (sortDir === 'asc' ? '↑' : '↓') : ''}`} active={sortBy === 'actuators'} onClick={() => handleSortChange('actuators')} />
            </DropdownPanel>
          </div>
        </div>
        {admin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Criar Dispositivo
          </Button>
        )}
      </div>

      <DataTable columns={admin ? [...baseColumns, { key: 'actions', label: 'Ações', center: true }] : baseColumns}>
        {paginated.map((device) => (
          <DataRow key={device.id}>
            <DataCell>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${device.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-medium text-navy-900 text-sm">{device.name}</p>
                  <p className="text-xs text-gray-400">{device.model}</p>
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
            {admin && (
              <DataCell center>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(device)}><Edit size={16} /></Button>
                  <Button variant="danger" size="icon" title="Ligar/Desligar" onClick={() => handleToggle(device)}>
                    <Power size={16} />
                  </Button>
                  <Button variant="danger" size="icon" title="Excluir" onClick={() => setConfirmDelete(device.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </DataCell>
            )}
          </DataRow>
        ))}
      </DataTable>

      <Pagination total={totalPages} current={page} onPageChange={setPage} />

      {showModal && <NewDeviceModal onClose={() => setShowModal(false)} onCreated={fetchDevices} />}
      {editing && <EditDeviceModal device={editing} onClose={() => setEditing(null)} onUpdated={fetchDevices} />}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir dispositivo"
          message="Tem certeza que deseja excluir este dispositivo? Todos os sensores e atuadores associados serão removidos."
          confirmLabel="Excluir"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
