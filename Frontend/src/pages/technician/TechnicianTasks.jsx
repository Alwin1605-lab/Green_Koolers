import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, LoadingSpinner, EmptyState, Input, Select } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function TechnicianTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-requests/my-assignments`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
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

  const filteredTasks = tasks.filter(task => {
    // Status filter
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = ['Assigned', 'In Progress'].includes(task.status)
    } else if (filterStatus !== 'all') {
      matchesStatus = task.status === filterStatus
    }

    // Search filter
    const matchesSearch = !searchQuery ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Group tasks by date for better organization
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const dateKey = task.scheduledDate
      ? new Date(task.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(task)
    return acc
  }, {})

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
        <p className="mt-1 text-slate-600">
          Manage and update your assigned service requests
        </p>
      </div>

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilterStatus('active')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterStatus === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Active ({tasks.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length})
        </button>
        <button
          onClick={() => setFilterStatus('Assigned')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterStatus === 'Assigned'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Assigned ({tasks.filter(t => t.status === 'Assigned').length})
        </button>
        <button
          onClick={() => setFilterStatus('In Progress')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterStatus === 'In Progress'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          In Progress ({tasks.filter(t => t.status === 'In Progress').length})
        </button>
        <button
          onClick={() => setFilterStatus('Completed')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterStatus === 'Completed'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Completed ({tasks.filter(t => t.status === 'Completed').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterStatus === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({tasks.length})
        </button>
      </div>

      {/* Search */}
      <Card>
        <Card.Content className="p-4">
          <Input
            placeholder="Search tasks by category, service type, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={() => (
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          />
        </Card.Content>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <Card.Content className="p-8">
            <EmptyState
              title={tasks.length === 0 ? "No tasks assigned" : "No matching tasks"}
              description={
                tasks.length === 0
                  ? "You don't have any tasks assigned yet"
                  : "Try adjusting your search or filter criteria"
              }
              action={
                tasks.length > 0 && (
                  <Button variant="secondary" onClick={() => { setSearchQuery(''); setFilterStatus('active') }}>
                    Clear Filters
                  </Button>
                )
              }
            />
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-semibold text-slate-500">{date}</h3>
              <div className="space-y-3">
                {dateTasks.map((task) => (
                  <Card key={task._id} className="hover:shadow-md transition-shadow">
                    <Card.Content className="p-0">
                      <Link to={`/technician/tasks/${task._id}`} className="block">
                        <div className="flex flex-col lg:flex-row">
                          {/* Left Section */}
                          <div className="flex flex-1 items-start gap-4 p-4 lg:p-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                              {getCategoryIcon(task.category)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-slate-900">{task.category}</h3>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                                  {task.status}
                                </span>
                                {task.priority && task.priority !== 'medium' && (
                                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-600">{task.serviceType}</p>

                              {/* Customer Info */}
                              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{task.customer?.name || 'Customer'}</span>
                                {task.customer?.phone && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span>{task.customer.phone}</span>
                                  </>
                                )}
                              </div>

                              {task.description && (
                                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Right Section - Arrow indicator */}
                          <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 p-4 lg:border-l lg:border-t-0 lg:bg-transparent lg:p-5">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TechnicianTasks
