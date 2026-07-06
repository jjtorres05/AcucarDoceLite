import { CheckCircle2 } from 'lucide-react'

export default function GoldPanel({ title, icon, actionLabel, onAction, footer, children }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="bg-gold-500 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            className="text-xs text-white/80 hover:bg-gold-100/50 font-medium cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="px-4 py-2">
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-center gap-1.5 pb-4 text-green-600">
          <CheckCircle2 size={14} />
          <span className="text-xs font-medium">{footer}</span>
        </div>
      )}
    </div>
  )
}
