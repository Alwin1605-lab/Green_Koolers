import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const emptyForm = { name: '', phone: '', email: '', address: '' }

function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/customers')
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const created = await api.post('/customers', form)
      setCustomers((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage client contacts and service history.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add customer</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            New record
          </span>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="name"
            placeholder="Customer name"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            Save customer
          </button>
          {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Customer list</h2>
          <button
            className="text-sm font-semibold text-brand-600"
            type="button"
            onClick={loadCustomers}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No customers yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-3 py-3 text-slate-600">{customer.phone}</td>
                    <td className="px-3 py-3 text-slate-600">{customer.email || '-'}</td>
                    <td className="px-3 py-3 text-slate-600">{customer.address || '-'}</td>
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

export default Customers
