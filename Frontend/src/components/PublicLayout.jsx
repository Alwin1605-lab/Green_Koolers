import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { COMPANY_INFO } from '../utils/constants.js'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
  }`

const mobileNavLinkClass = ({ isActive }) =>
  `block rounded-lg px-4 py-3 text-base font-medium transition ${
    isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
  }`

function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'customer': return '/customer'
      case 'technician': return '/technician'
      case 'admin':
      case 'staff': return '/app'
      default: return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Green Koolers logo" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-semibold text-slate-900">Green Koolers</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              Services
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="text-sm font-medium text-slate-600 hover:text-slate-900" to="/login">
                Login
              </Link>
            )}
            <Link
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              to="/book"
            >
              Book Service
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white md:hidden">
            <nav className="mx-auto max-w-6xl space-y-1 px-4 py-4">
              <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/services" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Services
              </NavLink>
              <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Contact
              </NavLink>
              
              <div className="my-4 border-t border-slate-100" />
              
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              
              <Link
                to="/book"
                className="mt-2 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-emerald-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a Service
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 bg-slate-950 text-slate-200">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Green Koolers logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-semibold text-white">{COMPANY_INFO.name}</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              {COMPANY_INFO.tagline}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Services
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link to="/services" className="hover:text-white">Residential AC</Link></li>
              <li><Link to="/services" className="hover:text-white">Industrial AC</Link></li>
              <li><Link to="/services" className="hover:text-white">HVAC Systems</Link></li>
              <li><Link to="/services" className="hover:text-white">Refrigeration</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Company
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link to="/services" className="hover:text-white">Our Services</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/book" className="hover:text-white">Book Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white">{COMPANY_INFO.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-white">{COMPANY_INFO.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{COMPANY_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-sm text-slate-400 sm:flex-row sm:px-6 sm:text-left">
            <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.</p>
            <p>{COMPANY_INFO.emergencyHours}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
