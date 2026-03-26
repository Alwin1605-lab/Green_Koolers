import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, LoadingSpinner } from '../../components/ui/index.js'
import { REQUEST_STATUSES, SERVICE_CATEGORIES, API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function TechnicianSchedule() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()))

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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const colorMap = {
      'Requested': 'bg-slate-100 text-slate-700',
      'Assigned': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-amber-100 text-amber-700',
      'Completed': 'bg-emerald-100 text-emerald-700',
      'Cancelled': 'bg-red-100 text-red-700'
    }
    return colorMap[status] || colorMap['Requested']
  }

  const getCategoryIcon = (categoryName) => {
    const category = SERVICE_CATEGORIES.find(c => c.name === categoryName)
    return category?.shortName || categoryName?.substring(0, 2) || 'SV'
  }

  // Get week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeek)
    day.setDate(day.getDate() + i)
    weekDays.push(day)
  }

  // Get tasks for each day
  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      if (!task.scheduledDate) return false
      const taskDate = new Date(task.scheduledDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
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
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="mt-1 text-slate-600">
            View your weekly task schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentWeek(getWeekStart(new Date()))}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Display */}
      <Card>
        <Card.Header>
          <Card.Title>
            {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`border-r border-slate-200 p-3 text-center last:border-r-0 ${
                  isToday(day) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-xs font-medium text-slate-500">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`mt-1 text-lg font-semibold ${
                  isToday(day) ? 'text-blue-600' : 'text-slate-900'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDay(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-slate-200 p-2 last:border-r-0 ${
                    isToday(day) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {dayTasks.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No tasks
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <Link
                          key={task._id}
                          to={`/technician/tasks/${task._id}`}
                          className="block rounded-lg bg-white p-2 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700">
                              {getCategoryIcon(task.category)}
                            </div>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(task.status)}`}>
                              {task.status === 'In Progress' ? 'Active' : task.status}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-900 truncate">
                            {task.category}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {task.customer?.name || 'Customer'}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card.Content>
      </Card>

      {/* Upcoming Tasks List */}
      <Card>
        <Card.Header>
          <Card.Title>Upcoming Tasks</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {tasks.filter(t => t.scheduledDate && new Date(t.scheduledDate) >= new Date() && t.status !== 'Completed').length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No upcoming tasks scheduled
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks
                .filter(t => t.scheduledDate && new Date(t.scheduledDate) >= new Date() && t.status !== 'Completed')
                .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
                .slice(0, 10)
                .map((task) => (
                  <Link
                    key={task._id}
                    to={`/technician/tasks/${task._id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-100 text-center">
                      <span className="text-[10px] font-medium text-slate-500">
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
          )}
        </Card.Content>
      </Card>
    </div>
  )
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export default TechnicianSchedule
