import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AdminSidebar from './components/admin/AdminSidebar'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AdminLogin from './pages/AdminLogin'
import AddEvent from './pages/admin/AddEvent'
import Dashboard from './pages/admin/Dashboard'
import ManageEvents from './pages/admin/ManageEvents'
import Registrations from './pages/admin/Registrations'
import EventDetails from './pages/EventDetails'
import Events from './pages/Events'
import Home from './pages/Home'
import Register from './pages/Register'
import RegistrationSuccess from './pages/RegistrationSuccess'
import { isAdminLoggedIn } from './services/auth'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function AdminLayout() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/register" element={<Register />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/events/add" element={<AddEvent />} />
          <Route path="/admin/registrations" element={<Registrations />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
