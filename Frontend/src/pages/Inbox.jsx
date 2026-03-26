import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../utils/constants.js'
import { getToken } from '../utils/auth.js'

const STATUS_COLORS = {
  unread: 'bg-blue-100 text-blue-700',
  read: 'bg-slate-100 text-slate-600',
  'auto-processed': 'bg-emerald-100 text-emerald-700',
  ignored: 'bg-slate-100 text-slate-400'
}

const STATUS_LABELS = {
  unread: 'Unread',
  read: 'Read',
  'auto-processed': 'Auto-Processed',
  ignored: 'Ignored'
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

function ScoreBar({ label, value, max = 30 }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200">
        <div
          className="h-1.5 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function EmailDetail({ email, customers, onClose, onStatusChange, onCreateRequest }) {
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleCreateRequest = async () => {
    if (!selectedCustomer) { setCreateError('Please select a customer'); return }
    setCreating(true)
    setCreateError('')
    try {
      await onCreateRequest(email._id, selectedCustomer)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">{email.subject}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              From: {email.from?.name ? `${email.from.name} ` : ''}<span className="text-slate-700">{email.from?.address}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(email.receivedAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* Status + inferred info */}
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[email.status]}`}>
              {STATUS_LABELS[email.status]}
            </span>
            {email.inferredCategory && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                Inferred: {email.inferredCategory}
              </span>
            )}
            {email.inferredServiceType && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {email.inferredServiceType}
              </span>
            )}
          </div>

          {/* Matched customer */}
          {email.matchedCustomer ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm">
              <p className="font-semibold text-emerald-800">Customer matched: {email.matchedCustomer.name}</p>
              <p className="text-emerald-600">{email.matchedCustomer.email} · {email.matchedCustomer.phone}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
              No matching customer found for <strong>{email.from?.address}</strong>
            </div>
          )}

          {/* Linked service request */}
          {email.serviceRequest && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
              <p className="font-semibold text-slate-700">Service Request Created</p>
              <p className="text-slate-500">{email.serviceRequest.category} — {email.serviceRequest.serviceType}</p>
              <p className="text-slate-500">Status: {email.serviceRequest.status}</p>
            </div>
          )}

          {/* Email body */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Email Body</p>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
              {email.bodyText || '(No plain text body)'}
            </pre>
          </div>

          {/* Manual create request (for unmatched emails) */}
          {!email.processed && email.status !== 'ignored' && (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Manually Create Service Request</p>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-3"
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.email || c.phone}</option>
                ))}
              </select>
              {createError && <p className="text-xs text-rose-600 mb-2">{createError}</p>}
              <button
                type="button"
                onClick={handleCreateRequest}
                disabled={creating}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Service Request with AI Assignment'}
              </button>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3">
          {email.status !== 'ignored' && email.status !== 'auto-processed' && (
            <button
              type="button"
              onClick={() => onStatusChange(email._id, 'ignored')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Ignore
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Inbox() {
  const [emails, setEmails] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [customers, setCustomers] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const loadEmails = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const data = await apiFetch(`/inbox?${params}`)
      setEmails(data.emails)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadEmails(1) }, [loadEmails, refreshKey])

  useEffect(() => {
    apiFetch('/customers').then(setCustomers).catch(() => {})
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshKey((k) => k + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const openEmail = async (email) => {
    try {
      const detail = await apiFetch(`/inbox/${email._id}`)
      setSelectedEmail(detail)
      // Update list item status if it changed to "read"
      setEmails((prev) => prev.map((e) => e._id === detail._id ? { ...e, status: detail.status } : e))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await apiFetch(`/inbox/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setEmails((prev) => prev.map((e) => e._id === id ? { ...e, status: updated.status } : e))
      if (selectedEmail?._id === id) setSelectedEmail((prev) => ({ ...prev, status: updated.status }))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateRequest = async (emailId, customerId) => {
    const result = await apiFetch(`/inbox/${emailId}/create-request`, {
      method: 'POST',
      body: JSON.stringify({ customerId })
    })
    setEmails((prev) =>
      prev.map((e) => e._id === emailId ? { ...e, status: 'auto-processed', processed: true } : e)
    )
    setSelectedEmail(null)
    return result
  }

  const unreadCount = emails.filter((e) => e.status === 'unread').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Customer Inbox
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">
            Emails received from customers via IMAP. Polled every 5 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['all', 'unread', 'read', 'auto-processed', 'ignored'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filterStatus === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Email list */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400 text-sm">No emails in this view</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Inferred Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emails.map((email) => (
                <tr
                  key={email._id}
                  className={`transition hover:bg-slate-50 ${email.status === 'unread' ? 'font-semibold' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-slate-900 truncate max-w-[140px]">
                      {email.from?.name || email.from?.address || '—'}
                    </p>
                    <p className="text-xs text-slate-400 font-normal truncate max-w-[140px]">
                      {email.from?.name ? email.from.address : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate text-slate-900">{email.subject}</p>
                    <p className="truncate text-xs text-slate-400 font-normal">
                      {email.bodyText?.slice(0, 60) || ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {email.inferredCategory ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                        {email.inferredCategory}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[email.status]}`}>
                      {STATUS_LABELS[email.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-normal whitespace-nowrap">
                    {new Date(email.receivedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEmail(email)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadEmails(pagination.page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadEmails(pagination.page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email detail modal */}
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          customers={customers}
          onClose={() => setSelectedEmail(null)}
          onStatusChange={handleStatusChange}
          onCreateRequest={handleCreateRequest}
        />
      )}
    </div>
  )
}

export default Inbox
