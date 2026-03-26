import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PublicLayout from './components/PublicLayout.jsx'
import CustomerLayout from './components/layout/CustomerLayout.jsx'
import TechnicianLayout from './components/layout/TechnicianLayout.jsx'
import AuthLanding from './pages/AuthLanding.jsx'
import LoginStaff from './pages/LoginStaff.jsx'
import LoginCustomer from './pages/LoginCustomer.jsx'
import SignupStaff from './pages/SignupStaff.jsx'
import SignupCustomer from './pages/SignupCustomer.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'
import Booking from './pages/Booking.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Customers from './pages/Customers.jsx'
import ServiceRequests from './pages/ServiceRequests.jsx'
import Inventory from './pages/Inventory.jsx'
import Schedule from './pages/Schedule.jsx'
import History from './pages/History.jsx'
import Invoices from './pages/Invoices.jsx'
import Inbox from './pages/Inbox.jsx'
import NotFound from './pages/NotFound.jsx'
import SetupAccount from './pages/SetupAccount.jsx'
// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx'
import CustomerBookings from './pages/customer/CustomerBookings.jsx'
import CustomerProfile from './pages/customer/CustomerProfile.jsx'
// Technician pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard.jsx'
import TechnicianTasks from './pages/technician/TechnicianTasks.jsx'
import TechnicianTaskDetail from './pages/technician/TechnicianTaskDetail.jsx'
import TechnicianSchedule from './pages/technician/TechnicianSchedule.jsx'
import TechnicianProfile from './pages/technician/TechnicianProfile.jsx'
import StaffProfile from './pages/staff/StaffProfile.jsx'

import { getToken, getUserRole } from './utils/auth.js'
import { requiresAccountSetup, isAccountSetupComplete } from './utils/accountSetup.js'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

function RequireAuth({ children }) {
  const { user } = useAuth()
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <div className="p-8 text-sm text-slate-500">Loading...</div>
  }

  if (user && requiresAccountSetup(user)) {
    return <Navigate to="/setup-account" replace />
  }

  return children
}

function RequireRole({ roles, children }) {
  const role = getUserRole()
  if (!role || !roles.includes(role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Redirect authenticated users to their appropriate dashboard
function AuthRedirect() {
  const { user } = useAuth()
  const token = getToken()
  const role = getUserRole()
  
  if (token && role) {
    if (user && requiresAccountSetup(user)) {
      return <Navigate to="/setup-account" replace />
    }

    switch (role) {
      case 'customer':
        return <Navigate to="/customer" replace />
      case 'technician':
        return <Navigate to="/technician" replace />
      case 'admin':
      case 'staff':
        return <Navigate to="/app" replace />
      default:
        return <AuthLanding />
    }
  }
  return <AuthLanding />
}

function SetupRedirect() {
  const { user } = useAuth()
  const role = getUserRole()
  const token = getToken()

  if (!token || !role) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <div className="p-8 text-sm text-slate-500">Loading account setup...</div>
  }

  if (isAccountSetupComplete(user)) {
    if (role === 'customer') return <Navigate to="/customer" replace />
    if (role === 'technician') return <Navigate to="/technician" replace />
    return <Navigate to="/app" replace />
  }

  return <SetupAccount />
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/book"
              element={
                <RequireAuth>
                  <RequireRole roles={["customer"]}>
                    <Booking />
                  </RequireRole>
                </RequireAuth>
              }
            />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<AuthRedirect />} />
          <Route path="/login/staff" element={<LoginStaff />} />
          <Route path="/login/customer" element={<LoginCustomer />} />
          <Route path="/signup/staff" element={<SignupStaff />} />
          <Route path="/signup/customer" element={<SignupCustomer />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup-account" element={<SetupRedirect />} />

          {/* Customer Portal Routes */}
          <Route
            path="/customer"
            element={
              <RequireAuth>
                <RequireRole roles={["customer"]}>
                  <CustomerLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Technician Portal Routes */}
          <Route
            path="/technician"
            element={
              <RequireAuth>
                <RequireRole roles={["technician"]}>
                  <TechnicianLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<TechnicianDashboard />} />
            <Route path="tasks" element={<TechnicianTasks />} />
            <Route path="tasks/:id" element={<TechnicianTaskDetail />} />
            <Route path="schedule" element={<TechnicianSchedule />} />
            <Route path="profile" element={<TechnicianProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Staff/Admin Portal Routes */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <RequireRole roles={["admin", "staff"]}>
                  <Layout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="service-requests" element={<ServiceRequests />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="history" element={<History />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
