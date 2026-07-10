import { Building2, AlertTriangle } from 'lucide-react'

export default function CompanyCard({ name, alerts, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 w-52 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-gold-300 transition cursor-pointer"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Building2 size={18} className="text-navy-800" />
        <span className="font-medium text-navy-900 text-sm">{name}</span>
      </div>
      {alerts != null && (
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <AlertTriangle size={13} className="text-orange-500" />
          <span className="text-orange-500 font-medium">{alerts} alertas recentes</span>
        </div>
      )}
    </button>
  )
}
