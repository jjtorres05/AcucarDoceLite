import { useState } from 'react'
import { Plus, Search, Filter, ArrowUpDown, Eye, Edit, Power, Trash2, Cpu, X } from 'lucide-react'
import NewDeviceModal from '../components/NewDeviceModal'

const devices = [
  { id: 1, name: 'Caldeira-A', model: 'ESPN-32', sensors: { total: 4, normal: 4 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
  { id: 2, name: 'Armazem-A', model: 'ESPN-33', sensors: { total: 3, alerts: [1, 1, 1] }, actuators: { total: 1, active: 1 }, status: 'Ativo' },
  { id: 3, name: 'Caldeira-B', model: 'ESPN-34', sensors: { total: 8, critical: 2, warning: 1, normal: 5 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
  { id: 4, name: 'Armazem-B', model: 'ESPN-35', sensors: { total: 2, offline: 2 }, actuators: { total: 1, active: 1 }, status: 'Inativo' },
  { id: 5, name: 'Caldeia-C', model: 'ESPN-30', sensors: { total: 4, normal: 4 }, actuators: { total: 2, offline: 2 }, status: 'Ativo' },
]

function StatusBadge({ status }) {
  const isActive = status === 'Ativo'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {status}
    </span>
  )
}

function SensorDots({ device }) {
  const dots = []
  if (device.sensors.critical) for (let i = 0; i < device.sensors.critical; i++) dots.push('red')
  if (device.sensors.warning) for (let i = 0; i < device.sensors.warning; i++) dots.push('orange')
  if (device.sensors.normal) for (let i = 0; i < device.sensors.normal; i++) dots.push('green')
  if (device.sensors.offline) for (let i = 0; i < device.sensors.offline; i++) dots.push('gray')
  if (device.sensors.alerts) device.sensors.alerts.forEach(() => dots.push('yellow'))

  return (
    <div className="flex items-center gap-1 mt-0.5">
      {dots.slice(0, 6).map((color, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${
          color === 'red' ? 'bg-red-500' :
          color === 'orange' ? 'bg-orange-500' :
          color === 'green' ? 'bg-green-500' :
          color === 'yellow' ? 'bg-yellow-500' :
          'bg-gray-400'
        }`} />
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

  const filtered = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Dispositivos</h1>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-navy-900 font-medium">
            Usina De Cambe
          </div>
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procure Um Dispositivo Pelo Nome"
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent w-72"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              showFilter ? 'bg-gold-500 text-white' : 'bg-gold-500 text-white'
            }`}
          >
            <Filter size={14} />
            Filtro
            {showFilter && <X size={12} />}
          </button>
          <button
            onClick={() => setShowSort(!showSort)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              showSort ? 'bg-gold-500 text-white' : 'bg-gold-500 text-white'
            }`}
          >
            <ArrowUpDown size={14} />
            Ordenar Por
            {showSort && <X size={12} />}
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition cursor-pointer"
        >
          <Plus size={16} />
          Criar Dispositivo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gold-100 border-b border-gold-200">
              <th className="text-left px-5 py-3 text-sm font-semibold text-navy-900">Nome / Modelo</th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-navy-900">Sensores</th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-navy-900">Atuadores</th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-navy-900">Status</th>
              <th className="text-center px-5 py-3 text-sm font-semibold text-navy-900">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((device) => (
              <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${device.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{device.name}</p>
                      <p className="text-xs text-gray-400">{device.model}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-navy-900">{device.sensors.total} sensores</p>
                  <SensorDots device={device} />
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-navy-900">{device.actuators.total} atuador{device.actuators.total !== 1 ? 'es' : ''}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {device.actuators.active ? `${device.actuators.active} ativo` : ''}
                    {device.actuators.offline ? `${device.actuators.offline} offline` : ''}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-navy-900 transition cursor-pointer" title="Ver">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-navy-900 transition cursor-pointer" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-navy-900 transition cursor-pointer" title="Ligar/Desligar">
                      <Power size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 gap-1">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition cursor-pointer ${
              page === 1 ? 'bg-gold-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {showModal && <NewDeviceModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
