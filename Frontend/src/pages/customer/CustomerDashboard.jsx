import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Card, Button, LoadingSpinner, EmptyState, StatCard } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusObj = REQUEST_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'slate'
  }

  const getStatusBadgeClass = (status) => {
    const colorMap = {
      slate: 'bg-slate-100 text-slate-700',
      blue: 'bg-blue-100 text-blue-700',
      amber: 'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700'
    }
    return colorMap[getStatusColor(status)] || colorMap.slate
  }

  const getCategoryIcon = (categoryName) => {
    const category = SERVICE_CATEGORIES.find(c => c.name === categoryName)
    return category?.shortName || categoryName?.substring(0, 2) || 'SV'
  }

  // Calculate stats
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['Requested', 'Assigned', 'In Progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    pending: bookings.filter(b => b.status === 'Requested').length
  }

  const recentBookings = bookings.slice(0, 5)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Customer'}
          </h1>
          <p className="mt-1 text-slate-600">
            Here's an overview of your service requests
          </p>
        </div>
        <Link to="/book">
          <Button variant="primary" className="gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book New Service
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="slate"
        />
        <StatCard
          title="Active Services"
          value={stats.active}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="emerald"
        />
      </div>

      {/* Recent Bookings */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Recent Service Requests</Card.Title>
            <Link to="/customer/bookings" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View all
            </Link>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          {recentBookings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No service requests yet"
                description="Book your first service to get started"
                action={
                  <Link to="/book">
                    <Button variant="primary">Book a Service</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                    {getCategoryIcon(booking.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{booking.category}</div>
                    <div className="text-sm text-slate-500">
                      {booking.serviceType} • {new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <Card.Content className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Book New Service</h3>
              <p className="text-sm text-slate-500">Schedule a maintenance or repair</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/book" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Book now →
            </Link>
          </Card.Footer>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Content className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">View All Bookings</h3>
              <p className="text-sm text-slate-500">Track and manage your requests</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/customer/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View bookings →
            </Link>
          </Card.Footer>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Content className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Update Profile</h3>
              <p className="text-sm text-slate-500">Manage your account details</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/customer/profile" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Edit profile →
            </Link>
          </Card.Footer>
        </Card>
      </div>

      {/* Support Section */}
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <Card.Content className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Need assistance?</h3>
            <p className="mt-1 text-emerald-100">
              Our support team is available 24/7 for emergency services
            </p>
          </div>
          <Link to="/contact">
            <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
              Contact Support
            </Button>
          </Link>
        </Card.Content>
      </Card>
    </div>
  )
}

export default CustomerDashboard
