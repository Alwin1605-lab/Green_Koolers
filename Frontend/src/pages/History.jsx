import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/history')
      setRecords(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Service History</h1>
          <p className="text-sm text-slate-500">Review maintenance records and past visits.</p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 p-6 text-center shadow-sm">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Loading history...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No history records</h2>
          <p className="mt-2 text-sm text-slate-500">Completed services will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Completed Services ({records.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Service Type</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Visit Date</th>
                  <th className="px-3 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {record.customer?.name || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {record.serviceRequest?.category || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {record.serviceRequest?.serviceType || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {record.performedBy?.name || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {record.visitDate
                        ? new Date(record.visitDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {record.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default History
