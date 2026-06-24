export default function Pagination({ total, current = 1, onPageChange }) {
  return (
    <div className="flex justify-end mt-4 gap-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition cursor-pointer ${
            page === current
              ? 'bg-gold-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}
