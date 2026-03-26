function DataTable({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '' 
}) {
  if (loading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="table-row">
                {columns.map((column) => (
                  <td key={column.key}>
                    <div className="skeleton h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container p-8 text-center">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className || ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row._id || row.id || rowIndex} 
              className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className={column.cellClassName || ''}>
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key] || '—'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
