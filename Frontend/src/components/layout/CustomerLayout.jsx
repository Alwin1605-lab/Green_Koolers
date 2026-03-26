import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Avatar } from '../ui/index.js'
import { useState } from 'react'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`

function CustomerLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/customer', label: 'Dashboard', icon: DashboardIcon, end: true },
    { to: '/customer/bookings', label: 'My Bookings', icon: BookingsIcon },
    { to: '/customer/profile', label: 'Profile', icon: ProfileIcon },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public nav top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700">
            <img src="/logo.png" alt="Green Koolers logo" className="h-5 w-5 rounded object-cover" />
            Green Koolers
          </Link>
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <Link to="/services" className="hover:text-slate-900">Services</Link>
          <Link to="/contact" className="hover:text-slate-900">Contact</Link>
        </div>
      </div>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-900">My Account</span>
        </div>
                <Avatar name={user?.name || 'Customer'} src={user?.photoUrl} size="sm" />
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <span className="font-semibold text-slate-900">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogoutIcon className="h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <img src="/logo.png" alt="Green Koolers logo" className="h-5 w-5 rounded object-cover" />
                  Green Koolers
                </div>
                <div className="font-semibold text-slate-900">Customer Portal</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name || 'Customer'} src={user?.photoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{user?.name || 'Customer'}</div>
                  <div className="truncate text-xs text-slate-500">{user?.email}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600"
            >
              <LogoutIcon className="h-5 w-5" />
              Log out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Icons
function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BookingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function ProfileIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

export default CustomerLayout
