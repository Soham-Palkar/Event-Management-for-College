import { CalendarDays, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAdminSession } from '../../services/auth'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/registrations', label: 'Registrations', icon: Users },
]

export default function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    clearAdminSession()
    navigate('/admin/login')
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <p className="font-semibold text-ink">EventHub Admin</p>
        <button
          type="button"
          className="rounded-md p-1 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin/events'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted hover:bg-slate-100 hover:text-ink'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-slate-100 hover:text-ink"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <p className="font-semibold">EventHub Admin</p>
        <button
          type="button"
          className="rounded-md p-2"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="hidden h-screen w-60 shrink-0 sticky top-0 border-r border-line bg-white lg:block">
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-64 bg-white shadow-lg">{nav}</aside>
        </div>
      ) : null}
    </>
  )
}
