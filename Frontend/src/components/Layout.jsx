import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { clearToken } from '../utils/auth.js'
import { api } from '../utils/api.js'

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
  }`

function Layout() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await api.get('/inbox/unread-count')
        setUnreadCount(data.count ?? 0)
      } catch {
        // silently ignore — inbox may not be configured
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60_000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public nav top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:text-brand-700">
            <img src="/logo.png" alt="Green Koolers logo" className="h-5 w-5 rounded object-cover" />
            Green Koolers
          </Link>
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <Link to="/services" className="hover:text-slate-900">Services</Link>
          <Link to="/contact" className="hover:text-slate-900">Contact</Link>
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-8 bg-slate-950 px-6 py-8 text-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            <img src="/logo.png" alt="Green Koolers logo" className="h-5 w-5 rounded object-cover" />
            Green Koolers
          </div>
          <div className="mt-2 text-lg font-semibold text-white">Service Management</div>
        </div>
        <nav className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Operations
          </div>
          <NavLink to="/app" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/app/customers" className={navLinkClass}>
            Customers
          </NavLink>
          <NavLink to="/app/service-requests" className={navLinkClass}>
            Service Requests
          </NavLink>
          <NavLink to="/app/schedule" className={navLinkClass}>
            Schedule
          </NavLink>
          <NavLink to="/app/inventory" className={navLinkClass}>
            Inventory
          </NavLink>
          <NavLink to="/app/history" className={navLinkClass}>
            Service History
          </NavLink>
          <NavLink to="/app/invoices" className={navLinkClass}>
            Invoices
          </NavLink>
          <NavLink to="/app/inbox" className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            }`
          }>
            <span>Inbox</span>
            {unreadCount > 0 ? (
              <span className="ml-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </NavLink>
        </nav>
        <div className="mt-auto rounded-2xl bg-slate-900/70 p-4 text-xs text-slate-300">
          Logged in as <span className="font-semibold text-white">Staff</span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
          onClick={handleLogout}
        >
          Log out
        </button>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Operations hub</p>
            <h1 className="text-lg font-semibold text-slate-900">Service Operations</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Admin Access
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-600 text-center text-sm font-semibold leading-9 text-white">
              CS
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  )
}

export default Layout
