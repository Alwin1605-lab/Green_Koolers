import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const emptyForm = { name: '', sku: '', quantity: 0, unit: '', location: '', minStock: 0 }

function Inventory() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadItems = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/inventory')
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const created = await api.post('/inventory', form)
      setItems((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">
            Monitor spare parts, stock levels, and restock needs.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add inventory item</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Stock control
          </span>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="name"
            placeholder="Item name"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="unit"
            placeholder="Unit (e.g. pcs, L)"
            value={form.unit}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="minStock"
            type="number"
            placeholder="Min stock"
            value={form.minStock}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            Save item
          </button>
          {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Inventory list</h2>
          <button className="text-sm font-semibold text-brand-600" type="button" onClick={loadItems}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No inventory items yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Quantity</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-3 py-3 text-slate-600">{item.sku}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{item.location || '-'}</td>
                    <td className="px-3 py-3 text-slate-600">{item.minStock}</td>
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

export default Inventory
