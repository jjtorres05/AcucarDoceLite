const variants = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800',
  gold: 'bg-gold-500 text-white hover:bg-gold-400',
  muted: 'bg-muted text-white hover:bg-muted/80',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-navy-900',
  danger: 'bg-transparent text-gray-500 hover:bg-red-50 hover:text-red-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
  icon: 'p-1.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
