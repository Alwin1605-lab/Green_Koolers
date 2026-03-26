import { Link } from 'react-router-dom'
import { COMPANY_INFO } from '../utils/constants.js'

function ForgotPassword() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-elevated">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="mt-3 text-sm text-slate-600">
            Password reset is managed by our support team. Contact us and we will verify your account and help you regain access.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p><span className="font-semibold">Email:</span> {COMPANY_INFO.email}</p>
            <p className="mt-1"><span className="font-semibold">Phone:</span> {COMPANY_INFO.phone}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary">Contact Support</Link>
            <Link to="/login" className="btn btn-secondary">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
