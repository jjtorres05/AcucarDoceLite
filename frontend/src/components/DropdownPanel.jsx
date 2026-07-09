export default function DropdownPanel({ open, children, refEl }) {
  if (!open) return null
  return (
    <div ref={refEl} className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20 min-w-[200px]">
      {children}
    </div>
  )
}
