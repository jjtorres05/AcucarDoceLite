import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CustomSelect({ label, required, hint, placeholder, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {required && <span className="text-red-500">* </span>}
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-white cursor-pointer flex items-center justify-between"
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {selected.icon && (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selected.iconBg || 'bg-gray-100'}`}>
                {selected.icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-navy-900 font-medium truncate">{selected.label}</p>
              {selected.sub && <p className="text-[11px] text-gray-400 truncate">{selected.sub}</p>}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="relative z-20">
          <div className="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false) }}
                className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-gold-100/50 transition cursor-pointer ${
                  value === option.value ? 'bg-gold-100/30' : ''
                }`}
              >
                {option.icon && (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${option.iconBg || 'bg-gray-100'}`}>
                    {option.icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-navy-900 font-medium truncate">{option.label}</p>
                  {option.sub && <p className="text-[11px] text-gray-400 truncate">{option.sub}</p>}
                </div>
                {option.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${option.badgeClass || 'bg-gray-100 text-gray-500'}`}>
                    {option.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
