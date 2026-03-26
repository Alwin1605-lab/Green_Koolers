import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Alert from '../components/ui/Alert.jsx'
import { UsersIcon } from '../components/ui/Icons.jsx'
import { requiresAccountSetup } from '../utils/accountSetup.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignupStaff() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'staff'
  })
  const [errors, setErrors] = useState({})
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
    const newErrors = {}
    let valid = true

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required'
      valid = false
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required'
      valid = false
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address'
      valid = false
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
      valid = false
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
      valid = false
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      valid = false
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      valid = false
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const user = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role
      })

      if (requiresAccountSetup(user)) {
        navigate('/setup-account')
      } else if (user.role === 'technician') {
        navigate('/technician')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center py-12">
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
              Staff Registration
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Join the Team
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Register as a staff member or technician to access the operations dashboard and manage service requests.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">Staff Access</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Manage service requests</li>
                  <li>Handle customer inquiries</li>
                  <li>Inventory management</li>
                  <li>Generate reports</li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">Technician Access</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>View assigned tasks</li>
                  <li>Update service status</li>
                  <li>Add service notes</li>
                  <li>Schedule management</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Content - Signup Form */}
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

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Staff Account</h2>
            <p className="text-slate-500 mb-6">Register with your work details</p>

            {error && (
              <Alert type="error" className="mb-6" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Smith"
                error={errors.name}
                required
              />

              <Select
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={[
                  { value: 'staff', label: 'Staff - Operations Management' },
                  { value: 'technician', label: 'Technician - Field Service' },
                  { value: 'admin', label: 'Admin - Full Access' }
                ]}
                required
              />

              <div className="grid sm:grid-cols-2 gap-5">
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
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+971 50 123 4567"
                  error={errors.phone}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  error={errors.password}
                  required
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  error={errors.confirmPassword}
                  required
                />
              </div>

              <Button type="submit" variant="secondary" loading={loading} className="w-full">
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login/staff" className="text-brand-600 font-medium hover:text-brand-700">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupStaff
