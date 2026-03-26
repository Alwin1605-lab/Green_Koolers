import { useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const categories = [
  'Residential AC',
  'Industrial AC',
  'HVAC',
  'Cassette AC',
  'Refrigeration',
  'Bakery Equipment',
  'Projects'
]

const emptyForm = {
  category: categories[0],
  serviceType: 'Maintenance',
  description: '',
  scheduledDate: ''
}

const availabilityOptions = ['Available Today', 'This Week', 'Next Week', 'Busy']
const experienceOptions = ['0', '3', '5', '8', '10', '15']
const ratingOptions = ['3.5', '4.0', '4.5', '4.7']

function Booking() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assigned, setAssigned] = useState(null)
  const [assignmentReason, setAssignmentReason] = useState(null)
  const [showReason, setShowReason] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [technicians, setTechnicians] = useState([])
  const [recommendedTechnicianId, setRecommendedTechnicianId] = useState(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null)
  const [techFilters, setTechFilters] = useState({
    minExperience: '',
    availability: '',
    minRating: ''
  })
  const [techLoading, setTechLoading] = useState(false)
  const [techError, setTechError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await api.get('/service-requests')
      setHistory(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const loadTechnicians = async (filters, currentSelection) => {
    setTechLoading(true)
    setTechError('')
    try {
      const params = new URLSearchParams()
      if (filters.minExperience) params.set('minExperience', filters.minExperience)
      if (filters.availability) params.set('availability', filters.availability)
      if (filters.minRating) params.set('minRating', filters.minRating)
      const queryString = params.toString()
      const data = await api.get(`/users/technicians${queryString ? `?${queryString}` : ''}`)
      setTechnicians(data.technicians || [])
      setRecommendedTechnicianId(data.recommendedTechnicianId || null)

      if (!data.technicians || data.technicians.length === 0) {
        setSelectedTechnicianId(null)
      } else if (!currentSelection || !data.technicians.find((tech) => tech._id === currentSelection)) {
        setSelectedTechnicianId(data.recommendedTechnicianId || data.technicians[0]._id)
      }
    } catch (err) {
      setTechError(err.message)
    } finally {
      setTechLoading(false)
    }
  }

  useEffect(() => {
    loadTechnicians(techFilters, selectedTechnicianId)
  }, [techFilters])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setAssigned(null)
    setAssignmentReason(null)
    setShowReason(false)
    try {
      const created = await api.post('/service-requests', {
        ...form,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null,
        preferredTechnicianId: selectedTechnicianId || null
      })
      setSuccess('Booking submitted. Our team will confirm your appointment shortly.')
      if (created.assignedTechnician) {
        setAssigned(created.assignedTechnician)
      }
      if (created.assignmentReason) {
        setAssignmentReason(created.assignmentReason)
      }
      setForm(emptyForm)
      loadHistory()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Booking</p>
            <h1 className="mt-4 text-3xl font-semibold">Book a service visit</h1>
            <p className="mt-3 text-sm text-slate-300">
              Tell us what you need and we will assign the right specialist for the job.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Response time</p>
                <p className="mt-2 text-lg font-semibold">Within 24 hours</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Coverage</p>
                <p className="mt-2 text-lg font-semibold">Residential & Industrial</p>
              </div>
            </div>
            {assigned ? (
              <div className="mt-8 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  Assigned technician
                </p>
                <p className="mt-2 text-lg font-semibold">{assigned.name}</p>
                <p className="text-sm text-slate-300">{assigned.email}</p>
                {assigned.phone ? <p className="text-sm text-slate-300">{assigned.phone}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Booking details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide service information for scheduling.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Installation">Installation</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Consultation">Consultation</option>
              </select>
              <input
                name="scheduledDate"
                type="date"
                value={form.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="description"
                placeholder="Describe the issue or scope"
                value={form.description}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2"
              >
                Submit booking
              </button>
              {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-600 md:col-span-2">{success}</p> : null}
            </form>

            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Choose your technician</h3>
                  <p className="text-sm text-slate-500">Filter by experience, availability, and rating.</p>
                </div>
                {recommendedTechnicianId ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Recommended highlighted
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <select
                  value={techFilters.minExperience}
                  onChange={(event) => setTechFilters((prev) => ({ ...prev, minExperience: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Min experience</option>
                  {experienceOptions.map((value) => (
                    <option key={value} value={value}>{value}+ years</option>
                  ))}
                </select>
                <select
                  value={techFilters.availability}
                  onChange={(event) => setTechFilters((prev) => ({ ...prev, availability: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Availability</option>
                  {availabilityOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <select
                  value={techFilters.minRating}
                  onChange={(event) => setTechFilters((prev) => ({ ...prev, minRating: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Min rating</option>
                  {ratingOptions.map((value) => (
                    <option key={value} value={value}>{value}+ stars</option>
                  ))}
                </select>
              </div>

              {techLoading ? (
                <p className="mt-4 text-sm text-slate-500">Loading technicians...</p>
              ) : techError ? (
                <p className="mt-4 text-sm text-rose-600">{techError}</p>
              ) : technicians.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No technicians match these filters.</p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {technicians.map((tech) => {
                    const isSelected = tech._id === selectedTechnicianId
                    const isRecommended = tech._id === recommendedTechnicianId
                    return (
                      <button
                        key={tech._id}
                        type="button"
                        onClick={() => setSelectedTechnicianId(tech._id)}
                        className={`text-left rounded-2xl border p-4 transition-all ${
                          isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                            {tech.photoUrl ? (
                              <img src={tech.photoUrl} alt={tech.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                                {tech.name?.charAt(0) || 'T'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{tech.name}</p>
                              {isRecommended ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Recommended
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500">{tech.availability || 'Availability not set'}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                              <span>{tech.experienceYears || 0} yrs exp</span>
                              <span>{tech.rating ? `${tech.rating.toFixed(1)} rating` : 'No rating'}</span>
                              <span>{tech.age ? `${tech.age} yrs` : 'Age n/a'}</span>
                            </div>
                            {tech.specialties?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {tech.specialties.map((specialty) => (
                                  <span key={specialty} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {tech.bio ? (
                              <p className="mt-2 text-xs text-slate-500">{tech.bio}</p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your booking history</h2>
            <button className="text-sm font-semibold text-brand-600" type="button" onClick={loadHistory}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Service</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Scheduled</th>
                    <th className="px-3 py-3">Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-900">{item.category}</td>
                      <td className="px-3 py-3 text-slate-600">{item.serviceType}</td>
                      <td className="px-3 py-3 text-slate-600">{item.status}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {item.assignedTechnician?.name || 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {assigned ? (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-white shadow-sm shrink-0">
                  {assigned.photoUrl ? (
                    <img src={assigned.photoUrl} alt={assigned.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                      {assigned.name?.charAt(0) || 'T'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-700">AI-assigned technician</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">{assigned.name}</p>
                  <p className="text-sm text-slate-600">{assigned.availability || 'Availability to be confirmed'}</p>
                </div>
              </div>
              {assignmentReason ? (
                <button
                  type="button"
                  onClick={() => setShowReason((prev) => !prev)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                >
                  {showReason ? 'Hide' : 'Why this technician?'}
                </button>
              ) : null}
            </div>

            {/* Basic stats */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
              <span>Experience: {assigned.experienceYears || 0} yrs</span>
              <span>Rating: {assigned.rating ? assigned.rating.toFixed(1) : 'n/a'}</span>
              {assignmentReason ? (
                <span className="font-semibold text-emerald-700">Score: {assignmentReason.score}/100</span>
              ) : null}
            </div>

            {/* Specialties */}
            {assigned.specialties?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {assigned.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {specialty}
                  </span>
                ))}
              </div>
            ) : null}

            {/* AI reason breakdown */}
            {showReason && assignmentReason ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Score breakdown</p>
                {assignmentReason.breakdown ? (
                  <div className="grid gap-2">
                    {[
                      { label: 'Specialty match', key: 'specialties', max: 30, color: 'bg-emerald-500' },
                      { label: 'Rating & experience', key: 'ratingExperience', max: 25, color: 'bg-sky-500' },
                      { label: 'Workload', key: 'workload', max: 20, color: 'bg-violet-500' },
                      { label: 'Service history', key: 'history', max: 15, color: 'bg-amber-500' },
                      { label: 'Availability', key: 'availability', max: 10, color: 'bg-rose-400' },
                    ].map(({ label, key, max, color }) => {
                      const val = assignmentReason.breakdown[key] ?? 0
                      const pct = Math.round((val / max) * 100)
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                            <span>{label}</span>
                            <span className="font-semibold">{val}/{max}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${color} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
                {assignmentReason.explanation ? (
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {assignmentReason.explanation}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default Booking
