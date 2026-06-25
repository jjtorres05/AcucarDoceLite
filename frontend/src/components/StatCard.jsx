export default function StatCard({ icon, label, value, color = 'text-navy-900' }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-5 py-4 flex-1">
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}
