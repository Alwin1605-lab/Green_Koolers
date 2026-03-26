import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, LoadingSpinner, Alert, Modal, Input } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function TechnicianTaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Note modal
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch task details')
      const data = await response.json()
      setTask(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true)
      setMessage({ type: '', text: '' })
      const response = await fetch(`${API_URL}/service-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update status')
      }

      const updatedTask = await response.json()
      setTask(updatedTask)
      setMessage({ type: 'success', text: `Status updated to "${newStatus}"` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUpdating(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    try {
      setAddingNote(true)
      const response = await fetch(`${API_URL}/service-requests/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ note: newNote })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add note')
      }

      const updatedTask = await response.json()
      setTask(updatedTask)
      setNewNote('')
      setShowNoteModal(false)
      setMessage({ type: 'success', text: 'Note added successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setAddingNote(false)
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

  const getNextStatus = (currentStatus) => {
    const flow = {
      'Assigned': 'In Progress',
      'In Progress': 'Completed'
    }
    return flow[currentStatus]
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <Alert variant="error">
          {error || 'Task not found'}
        </Alert>
        <div className="mt-4">
          <Link to="/technician/tasks">
            <Button variant="secondary">Back to Tasks</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/technician/tasks" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tasks
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
              {getCategoryIcon(task.category)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{task.category}</h1>
              <p className="text-slate-600">{task.serviceType}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusBadgeClass(task.status)}`}>
            {task.status}
          </span>
          {task.priority && (
            <span className={`rounded-full px-4 py-2 text-sm font-medium ${
              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
              task.priority === 'low' ? 'bg-slate-100 text-slate-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <Alert variant={message.type}>
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progress */}
          <Card>
            <Card.Header>
              <Card.Title>Service Progress</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-0.5 bg-slate-200 sm:left-0 sm:top-4 sm:h-0.5 sm:w-full" />
                
                <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
                  {getStatusSteps(task.status).map((step, index) => (
                    <div key={step.name} className="relative flex items-center gap-4 sm:flex-col sm:items-center">
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        step.completed
                          ? 'bg-blue-600 text-white'
                          : step.current
                            ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600'
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

              {/* Action Buttons */}
              {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                  {getNextStatus(task.status) && (
                    <Button
                      variant="primary"
                      onClick={() => updateStatus(getNextStatus(task.status))}
                      disabled={updating}
                      className="gap-2"
                    >
                      {updating ? 'Updating...' : (
                        <>
                          {task.status === 'Assigned' && (
                            <>
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Start Work
                            </>
                          )}
                          {task.status === 'In Progress' && (
                            <>
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Mark Complete
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowNoteModal(true)}
                    className="gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Note
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Service Details */}
          <Card>
            <Card.Header>
              <Card.Title>Service Details</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</label>
                  <p className="mt-1 font-medium text-slate-900">{task.category}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Service Type</label>
                  <p className="mt-1 font-medium text-slate-900">{task.serviceType}</p>
                </div>
              </div>

              {task.description && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
                  <p className="mt-1 text-slate-900">{task.description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Scheduled Date</label>
                  <p className="mt-1 font-medium text-slate-900">
                    {task.scheduledDate
                      ? new Date(task.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Requested On</label>
                  <p className="mt-1 font-medium text-slate-900">
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Notes */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Notes & Updates</Card.Title>
                <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(true)}>
                  Add Note
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {(!task.notes || task.notes.length === 0) ? (
                <p className="text-center text-slate-500 py-4">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {task.notes.map((note, index) => (
                    <div key={index} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                        {note.author?.charAt(0) || 'T'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{note.author || 'Technician'}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{note.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <Card.Header>
              <Card.Title className="text-base">Customer Information</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  {task.customer?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{task.customer?.name || 'Customer'}</p>
                  <p className="text-sm text-slate-500">Customer</p>
                </div>
              </div>

              {task.customer?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${task.customer.phone}`} className="text-blue-600 hover:text-blue-700">
                    {task.customer.phone}
                  </a>
                </div>
              )}

              {task.customer?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${task.customer.email}`} className="text-blue-600 hover:text-blue-700">
                    {task.customer.email}
                  </a>
                </div>
              )}

              {task.customer?.address && (
                <div className="flex items-start gap-3 text-sm">
                  <svg className="h-5 w-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-slate-600">{task.customer.address}</span>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <Card.Title className="text-base">Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-2">
              {task.customer?.phone && (
                <a
                  href={`tel:${task.customer.phone}`}
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Customer
                </a>
              )}
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Add Note
              </button>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Note</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={addNote} disabled={addingNote || !newNote.trim()}>
              {addingNote ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TechnicianTaskDetail
