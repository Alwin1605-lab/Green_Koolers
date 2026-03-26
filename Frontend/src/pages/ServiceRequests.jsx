import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const categories = [
  'Residential AC',
  'Industrial AC',
  'HVAC',
  'Cassette AC',
  'Refrigeration',
  'Bakery Equipment',
  'Projects'
]

const emptyForm = {
  customer: '',
  category: categories[0],
  serviceType: '',
  description: '',
  scheduledDate: '',
  assignedTechnician: ''
}

function ServiceRequests() {
  const [requests, setRequests] = useState([])
  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [reqs, custs, users] = await Promise.all([
        api.get('/service-requests'),
        api.get('/customers'),
        api.get('/users')
      ])
      setRequests(reqs)
      setCustomers(custs)
      setTechnicians(users.filter((user) => user.role === 'technician'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        assignedTechnician: form.assignedTechnician || null,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null
      }
      const created = await api.post('/service-requests', payload)
      setRequests((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Service Requests</h1>
          <p className="text-sm text-slate-500">
            Track maintenance, installation, and project requests.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Create request</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Service workflow
          </span>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <select
            name="customer"
            value={form.customer}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            name="serviceType"
            placeholder="Service type (Maintenance / Installation)"
            value={form.serviceType}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="scheduledDate"
            type="date"
            value={form.scheduledDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            name="assignedTechnician"
            value={form.assignedTechnician}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Assign technician</option>
            {technicians.map((tech) => (
              <option key={tech._id} value={tech._id}>
                {tech.name}
              </option>
            ))}
          </select>
          <input
            name="description"
            placeholder="Request description"
            value={form.description}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            Save request
          </button>
          {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Request list</h2>
          <button
            className="text-sm font-semibold text-brand-600"
            type="button"
            onClick={loadData}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No requests yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Scheduled</th>
                  <th className="px-3 py-3">Technician</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {request.customer?.name || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{request.category}</td>
                    <td className="px-3 py-3 text-slate-600">{request.status}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {request.scheduledDate ?
                        new Date(request.scheduledDate).toLocaleDateString() :
                        '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {request.assignedTechnician?.name || '—'}
                    </td>
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

export default ServiceRequests
