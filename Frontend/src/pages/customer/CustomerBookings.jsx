import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, LoadingSpinner, EmptyState, Input, Select, Modal } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function CustomerBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewStatus, setReviewStatus] = useState({ loading: false, message: '', error: '' })

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reviewId = params.get('review')
    if (!reviewId) return
    const booking = bookings.find((b) => b._id === reviewId)
    if (booking && booking.status === 'Completed') {
      setReviewTarget(booking)
    }
  }, [bookings])

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

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesSearch = !searchQuery ||
      booking.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const openDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewTarget) return

    setReviewStatus({ loading: true, message: '', error: '' })
    try {
      const response = await fetch(`${API_URL}/service-requests/${reviewTarget._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(reviewForm)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to submit review')

      setBookings((prev) => prev.map((b) => (b._id === data._id ? data : b)))
      setReviewStatus({ loading: false, message: 'Review submitted. Thank you!', error: '' })
      setTimeout(() => setReviewTarget(null), 1200)
    } catch (err) {
      setReviewStatus({ loading: false, message: '', error: err.message })
    }
  }

  const getStatusSteps = (status) => {
    const steps = ['Requested', 'Assigned', 'In Progress', 'Completed']
    const currentIndex = steps.indexOf(status)
    return steps.map((step, index) => ({
      name: step,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex
    }))
  }

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
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="mt-1 text-slate-600">
            View and track all your service requests
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

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={() => (
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="sm:w-48"
            >
              <option value="all">All Statuses</option>
              {REQUEST_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
        </Card.Content>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <Card.Content className="p-8">
            <EmptyState
              title={bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
              description={
                bookings.length === 0
                  ? "Book your first service to get started"
                  : "Try adjusting your search or filter criteria"
              }
              action={
                bookings.length === 0 ? (
                  <Link to="/book">
                    <Button variant="primary">Book a Service</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" onClick={() => { setSearchQuery(''); setFilterStatus('all') }}>
                    Clear Filters
                  </Button>
                )
              }
            />
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-md transition-shadow">
              <Card.Content className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Section */}
                  <div className="flex flex-1 items-start gap-4 p-4 lg:p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                      {getCategoryIcon(booking.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{booking.category}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{booking.serviceType}</p>
                      {booking.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{booking.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            : 'Not scheduled'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4 lg:border-l lg:border-t-0 lg:bg-transparent lg:p-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(booking)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Service Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-700">
                {getCategoryIcon(selectedBooking.category)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedBooking.category}</h3>
                <p className="text-slate-600">{selectedBooking.serviceType}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Status Progress */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">Service Progress</h4>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {getStatusSteps(selectedBooking.status).map((step, index) => (
                    <div key={step.name} className="relative flex items-center gap-4">
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        step.completed
                          ? 'bg-emerald-500 text-white'
                          : step.current
                            ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500'
                            : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step.completed ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        step.completed || step.current ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Scheduled Date</label>
                <p className="mt-1 text-slate-900">
                  {selectedBooking.scheduledDate
                    ? new Date(selectedBooking.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not yet scheduled'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Requested On</label>
                <p className="mt-1 text-slate-900">
                  {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedBooking.description && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
                <p className="mt-1 text-slate-900">{selectedBooking.description}</p>
              </div>
            )}

            {/* Technician Info */}
            {selectedBooking.assignedTechnician && (
              <div className="rounded-lg border border-slate-200 p-4">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned Technician</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {selectedBooking.assignedTechnician.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{selectedBooking.assignedTechnician.name || 'Technician'}</p>
                    <p className="text-sm text-slate-500">Service Technician</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Link to="/contact">
                <Button variant="primary">Contact Support</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title="Confirm Resolution & Review"
      >
        {reviewTarget ? (
          <form className="space-y-4" onSubmit={submitReview}>
            <p className="text-sm text-slate-600">
              Is your issue for <strong>{reviewTarget.category}</strong> solved? Please rate your service experience.
            </p>
            <div>
              <label className="label">Rating</label>
              <select
                className="select"
                value={String(reviewForm.rating)}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>
            <Input
              label="Review Comment"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell us about your experience"
            />

            {reviewStatus.error ? <p className="text-sm text-rose-600">{reviewStatus.error}</p> : null}
            {reviewStatus.message ? <p className="text-sm text-emerald-600">{reviewStatus.message}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setReviewTarget(null)}>Cancel</Button>
              <Button type="submit" loading={reviewStatus.loading}>Submit Review</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  )
}

export default CustomerBookings
