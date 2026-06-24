import { Search } from 'lucide-react'

export default function Input({
  label,
  required,
  hint,
  icon,
  className = '',
  ...props
}) {
  const hasIcon = icon === 'search'

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {required && <span className="text-red-500">* </span>}
          {label}
        </label>
      )}
      <div className="relative">
        {hasIcon && (
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition ${hasIcon ? 'pl-9' : ''}`}
          {...props}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
