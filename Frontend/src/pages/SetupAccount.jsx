import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { API_URL } from '../utils/constants.js'
import { getToken } from '../utils/auth.js'
import { requiresPasswordSetup, isAccountSetupComplete } from '../utils/accountSetup.js'

function SetupAccount() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState('password')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    locality: '',
    pincode: '',
    photoUrl: '',
    specialization: '',
    department: ''
  })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        })

        if (!response.ok) throw new Error('Failed to load profile')
        const data = await response.json()
        setProfile({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          locality: data.locality || '',
          pincode: data.pincode || '',
          photoUrl: data.photoUrl || '',
          specialization: data.specialization || '',
          department: data.department || ''
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingProfile(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (user && !requiresPasswordSetup(user)) {
      setStep('profile')
    }
  }, [user])

  const finishSetup = (hydratedUser) => {
    if (hydratedUser.role === 'customer') navigate('/customer', { replace: true })
    else if (hydratedUser.role === 'technician') navigate('/technician', { replace: true })
    else navigate('/app', { replace: true })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSavingPassword(true)
    try {
      const body = {
        newPassword: passwordData.newPassword
      }
      if (!requiresPasswordSetup(user)) {
        body.currentPassword = passwordData.currentPassword
      }

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to change password')

      await refreshProfile()
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Password changed. Complete your profile now.')
      setStep('profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!profile.name.trim() || !profile.phone.trim() || !profile.city.trim() || !profile.locality.trim() || !profile.pincode.trim()) {
      setError('Name, phone, city, locality, and pincode are required')
      return
    }

    setSavingProfile(true)
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update profile')

      const hydratedUser = await refreshProfile()
      setSuccess('Profile completed successfully.')

      if (hydratedUser && isAccountSetupComplete(hydratedUser)) {
        finishSetup(hydratedUser)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  if (loadingProfile) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading setup...</div>
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-elevated">
        <h1 className="text-2xl font-bold text-slate-900">Complete Account Setup</h1>
        <p className="mt-2 text-sm text-slate-600">
          {requiresPasswordSetup(user)
            ? 'For security, set a new password first, then complete your profile details.'
            : 'Complete your profile details to continue.'}
        </p>

        <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest">
          <span className={`rounded-full px-3 py-1 ${step === 'password' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>1. Password</span>
          <span className={`rounded-full px-3 py-1 ${step === 'profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>2. Profile</span>
        </div>

        {error ? <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {success ? <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            {!requiresPasswordSetup(user) ? (
              <div>
                <label className="label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input className="input" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">City</label>
                <input className="input" value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Locality</label>
                <input className="input" value={profile.locality} onChange={(e) => setProfile((p) => ({ ...p, locality: e.target.value }))} />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" value={profile.pincode} onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Profile Photo URL</label>
              <input className="input" value={profile.photoUrl} onChange={(e) => setProfile((p) => ({ ...p, photoUrl: e.target.value }))} placeholder="https://..." />
            </div>

            {user?.role === 'technician' ? (
              <div>
                <label className="label">Specialization</label>
                <input className="input" value={profile.specialization} onChange={(e) => setProfile((p) => ({ ...p, specialization: e.target.value }))} />
              </div>
            ) : null}

            {(user?.role === 'admin' || user?.role === 'staff') ? (
              <div>
                <label className="label">Department</label>
                <input className="input" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} />
              </div>
            ) : null}

            <button className="btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving Profile...' : 'Complete Setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default SetupAccount
