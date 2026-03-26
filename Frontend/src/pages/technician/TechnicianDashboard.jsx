import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Card, Button, LoadingSpinner, StatCard } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function TechnicianDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-amber-100 text-amber-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-slate-100 text-slate-700'
    }
    return colors[priority] || colors.medium
  }

  // Calculate stats
  const stats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'Assigned').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length
  }

  // Get today's tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysTasks = tasks.filter(t => {
    if (!t.scheduledDate) return false
    const taskDate = new Date(t.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime()
  })

  // Get upcoming tasks (next 7 days)
  const upcoming = tasks.filter(t => {
    if (!t.scheduledDate) return false
    const taskDate = new Date(t.scheduledDate)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    return taskDate > today && taskDate <= weekFromNow && t.status !== 'Completed'
  })

  // Active tasks (Assigned or In Progress)
  const activeTasks = tasks.filter(t => ['Assigned', 'In Progress'].includes(t.status)).slice(0, 5)

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
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'Technician'}
          </h1>
          <p className="mt-1 text-slate-600">
            {todaysTasks.length > 0
              ? `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} scheduled for today`
              : 'No tasks scheduled for today'}
          </p>
        </div>
        <Link to="/technician/tasks">
          <Button variant="primary" className="gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Tasks
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assigned"
          value={stats.total}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="slate"
        />
        <StatCard
          title="Awaiting Start"
          value={stats.assigned}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Tasks */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Active Tasks</Card.Title>
              <Link to="/technician/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {activeTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No active tasks at the moment
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeTasks.map((task) => (
                  <Link
                    key={task._id}
                    to={`/technician/tasks/${task._id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{task.category}</div>
                      <div className="text-sm text-slate-500">
                        {task.serviceType} • {task.customer?.name || 'Customer'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                      {task.scheduledDate && (
                        <span className="text-xs text-slate-500">
                          {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Today's Schedule</Card.Title>
              <span className="text-sm text-slate-500">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {todaysTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No tasks scheduled for today
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todaysTasks.map((task) => (
                  <Link
                    key={task._id}
                    to={`/technician/tasks/${task._id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : task.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.status === 'Completed' ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{task.category}</div>
                      <div className="text-sm text-slate-500">{task.customer?.name || 'Customer'}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      {upcoming.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Upcoming This Week</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="divide-y divide-slate-100">
              {upcoming.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  to={`/technician/tasks/${task._id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-100 text-center">
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(task.scheduledDate).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {new Date(task.scheduledDate).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{task.category}</div>
                    <div className="text-sm text-slate-500">{task.serviceType} • {task.customer?.name || 'Customer'}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                    {task.status}
                  </span>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <Card.Content className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">All Tasks</h3>
              <p className="text-sm text-slate-500">View and manage your tasks</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/technician/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View tasks →
            </Link>
          </Card.Footer>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Content className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Schedule</h3>
              <p className="text-sm text-slate-500">View your weekly schedule</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/technician/schedule" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View schedule →
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
              <h3 className="font-medium text-slate-900">Profile</h3>
              <p className="text-sm text-slate-500">Update your information</p>
            </div>
          </Card.Content>
          <Card.Footer className="bg-slate-50 px-6 py-3">
            <Link to="/technician/profile" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Edit profile →
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export default TechnicianDashboard
