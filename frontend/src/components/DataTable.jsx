export function DataTable({ columns, children }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gold-500 border-b border-gold-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 text-sm font-semibold text-navy-900 ${col.center ? 'text-center' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function DataRow({ children }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gold-100/50 transition">
      {children}
    </tr>
  )
}

export function DataCell({ children, center }) {
  return (
    <td className={`px-5 py-4 ${center ? 'text-center' : ''}`}>
      {children}
    </td>
  )
}
