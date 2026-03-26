import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link className="mt-4 inline-flex text-sm font-semibold text-brand-600" to="/app">
        Back to dashboard
      </Link>
    </div>
  )
}

export default NotFound
