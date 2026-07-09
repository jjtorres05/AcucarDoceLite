export default function FilterOption({ label, active, onClick }) {
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
