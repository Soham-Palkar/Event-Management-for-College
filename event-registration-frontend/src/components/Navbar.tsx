import { useState } from 'react'
import { CalendarDays, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const eventsActive = location.pathname.startsWith('/events')

  function linkClass(isActive: boolean) {
    return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand' : 'text-muted hover:text-ink'
    }`
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          EventHub
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                linkClass(link.to === '/events' ? eventsActive : isActive)
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <NavLink
            to="/admin/login"
            className={({ isActive }) =>
              `rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-line text-ink hover:border-brand hover:text-brand'
              }`
            }
          >
            Admin Login
          </NavLink>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-line bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  linkClass(link.to === '/events' ? eventsActive : isActive)
                }
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              className="mt-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              Admin Login
            </NavLink>
          </div>
        </div>
      ) : null}
    </header>
  )
}
