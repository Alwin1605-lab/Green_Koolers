import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Button, Input, LoadingSpinner, Alert } from '../../components/ui/index.js'
import { API_URL } from '../../utils/constants.js'
import { getToken } from '../../utils/auth.js'

function CustomerProfile() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const fromSignup = location.state?.fromSignup === true
  const fromLogin = location.state?.fromLogin === true
  const showSetupBanner = fromSignup || fromLogin

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    locality: '',
    pincode: '',
    photoUrl: '',
    company: '',
    createdAt: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          locality: data.locality || '',
          pincode: data.pincode || '',
          photoUrl: data.photoUrl || '',
          company: data.company || '',
          createdAt: data.createdAt || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(profile)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setChangingPassword(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to change password')
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setChangingPassword(false)
    }
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
      {/* Profile setup banner shown after signup or when profile is incomplete on login */}
      {showSetupBanner && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-brand-900">
                  {fromSignup ? 'Welcome! Complete your profile to get started.' : 'Your profile is incomplete.'}
                </p>
                <p className="mt-0.5 text-sm text-brand-700">
                  Please fill in your name and phone number, then click Save Changes.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customer')}
              className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-800 whitespace-nowrap"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="mt-1 text-slate-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <Alert variant={message.type}>
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <Card>
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                    disabled
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+971 50 000 0000"
                  />
                  <Input
                    label="Company (Optional)"
                    name="company"
                    value={profile.company}
                    onChange={handleProfileChange}
                    placeholder="Your company name"
                  />
                </div>
                <Input
                  label="Address"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="Your address"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    name="city"
                    value={profile.city}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="Locality"
                    name="locality"
                    value={profile.locality}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleProfileChange}
                  />
                </div>
                <Input
                  label="Profile Photo URL"
                  name="photoUrl"
                  value={profile.photoUrl}
                  onChange={handleProfileChange}
                  placeholder="https://..."
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <Card.Title>Change Password</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="secondary" disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Preview */}
          <Card>
            <Card.Content className="p-6 text-center">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name || 'User'} className="mx-auto h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-bold text-white">
                  {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              )}
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{profile.name || 'User'}</h3>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Customer Account
                </span>
              </div>
            </Card.Content>
          </Card>

          {/* Account Info */}
          <Card>
            <Card.Header>
              <Card.Title className="text-base">Account Details</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Account Type</span>
                <span className="font-medium text-slate-900">Customer</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Member Since</span>
                <span className="font-medium text-slate-900">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </Card.Content>
          </Card>

          {/* Help Card */}
          <Card className="bg-slate-50">
            <Card.Content className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Need Help?</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Contact our support team for assistance with your account.
                  </p>
                  <a href="/contact" className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Contact Support →
                  </a>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile
