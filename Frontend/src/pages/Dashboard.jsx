import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

function Dashboard() {
  const [stats, setStats] = useState({ active: 0, today: 0, lowStock: 0 })
  const [recent, setRecent] = useState([])

  const loadStats = async () => {
    const [requests, inventory] = await Promise.all([
      api.get('/service-requests'),
      api.get('/inventory')
    ])

    const today = new Date().toDateString()
    const scheduledToday = requests.filter((request) => {
      if (!request.scheduledDate) return false
      return new Date(request.scheduledDate).toDateString() === today
    })

    const lowStock = inventory.filter((item) => item.quantity <= item.minStock)
    const openRequests = requests.filter((request) => request.status !== 'Completed')

    setStats({
      active: openRequests.length,
      today: scheduledToday.length,
      lowStock: lowStock.length
    })

    setRecent(requests.slice(0, 5))
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Service Operations Dashboard</h1>
          <p className="text-sm text-slate-500">
            Track requests, schedules, and inventory at a glance.
          </p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Create request
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Active', value: stats.active, note: 'Open service requests', tone: 'bg-sky-100 text-sky-700' },
          { label: 'Today', value: stats.today, note: 'Scheduled visits', tone: 'bg-emerald-100 text-emerald-700' },
          { label: 'Inventory', value: stats.lowStock, note: 'Low stock parts', tone: 'bg-indigo-100 text-indigo-700' }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.tone}`}>
              {card.label}
            </span>
            <div className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</div>
            <p className="text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Service Requests</h2>
          <button className="text-sm font-semibold text-brand-600" type="button" onClick={loadStats}>
            Refresh
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No service requests yet. Create your first request to see updates here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((request) => (
                  <tr key={request._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {request.customer?.name || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{request.category}</td>
                    <td className="px-3 py-3 text-slate-600">{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard
