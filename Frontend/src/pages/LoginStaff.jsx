import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Alert from '../components/ui/Alert.jsx'
import { UsersIcon } from '../components/ui/Icons.jsx'
import { requiresAccountSetup } from '../utils/accountSetup.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginStaff() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = { email: '', password: '' }
    let valid = true

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required'
      valid = false
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address'
      valid = false
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
      valid = false
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    try {
      // Don't enforce role on login - let backend determine access
      const user = await login(form.email.trim(), form.password)

      // Redirect based on role, checking profile completeness
      if (requiresAccountSetup(user)) {
        navigate('/setup-account')
      } else if (user.role === 'technician') {
        navigate('/technician')
      } else if (user.role === 'customer') {
        navigate('/customer')
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white hidden lg:block">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-8">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Portal Selection
            </Link>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-slate-300 mb-6">
              <UsersIcon className="w-4 h-4" />
              Staff & Technician Portal
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Operations Hub
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Access the service management dashboard to handle requests, manage inventory, schedule technicians, and more.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Manage service requests</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Assign and track technicians</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Monitor inventory and reports</span>
              </div>
            </div>
          </div>

          {/* Right Content - Login Form */}
          <div className="bg-white rounded-3xl p-8 shadow-elevated max-w-md mx-auto w-full lg:max-w-none">
            <div className="lg:hidden mb-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm font-medium mb-6">
              Staff Portal
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Staff Sign In</h2>
            <p className="text-slate-500 mb-8">Access the operations dashboard</p>

            {error && (
              <Alert type="error" className="mb-6" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                error={errors.email}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                    Forgot password?
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <Button type="submit" variant="secondary" loading={loading} className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                New staff member?{' '}
                <Link to="/signup/staff" className="text-brand-600 font-medium hover:text-brand-700">
                  Register Account
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Customer account?{' '}
                <Link to="/login/customer" className="text-brand-600 font-medium hover:text-brand-700">
                  Go to Customer Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginStaff
