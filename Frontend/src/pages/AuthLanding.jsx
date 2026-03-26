import { Link } from 'react-router-dom'
import { 
  UserIcon, 
  UsersIcon,
  ArrowRightIcon,
  ShieldIcon,
  WrenchIcon 
} from '../components/ui/Icons.jsx'
import { COMPANY_INFO } from '../utils/constants.js'

function AuthLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-brand-300 mb-6">
              <ShieldIcon className="w-4 h-4" />
              Secure Access Portal
            </div>

            <h1 className="heading-xl text-white mb-6">
              {COMPANY_INFO.name}
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Access your account to book services, track requests, and manage your operations. Choose your portal to continue.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">For Customers</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    Book service appointments
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    Track service progress
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    View service history
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">For Staff & Technicians</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    Manage service requests
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    Update task status
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="w-3 h-3 text-brand-400" />
                    Access inventory & reports
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Content - Portal Selection */}
          <div className="bg-white rounded-3xl p-8 shadow-elevated">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome</h2>
            <p className="text-slate-500 mb-8">Select your account type to continue</p>

            <div className="space-y-4">
              {/* Customer Portal */}
              <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-brand-500 hover:bg-brand-50/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="icon-box-lg bg-brand-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <UserIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Customer Portal</h3>
                    <p className="text-sm text-slate-500 mb-4">Book and track service appointments</p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/login/customer" className="btn-primary btn-sm">
                        Sign In
                      </Link>
                      <Link to="/signup/customer" className="btn-outline btn-sm">
                        Create Account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Portal */}
              <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-brand-500 hover:bg-brand-50/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="icon-box-lg bg-slate-100 text-slate-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <UsersIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Staff Portal</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage operations, customers, and inventory</p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/login/staff" className="btn-secondary btn-sm">
                        Sign In
                      </Link>
                      <Link to="/signup/staff" className="btn-outline btn-sm">
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Portal */}
              <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-brand-500 hover:bg-brand-50/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="icon-box-lg bg-amber-100 text-amber-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <WrenchIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Technician Portal</h3>
                    <p className="text-sm text-slate-500 mb-4">View assigned tasks and update status</p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/login/staff" className="btn-outline btn-sm">
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Need help? <Link to="/contact" className="text-brand-600 font-medium hover:text-brand-700">Contact Support</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLanding
