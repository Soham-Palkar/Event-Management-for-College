import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <CalendarDays className="h-4 w-4 text-brand" aria-hidden="true" />
          EventHub
        </div>
        <p className="text-sm text-muted">
          College event registration platform.
        </p>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="text-muted hover:text-ink">
            Home
          </Link>
          <Link to="/events" className="text-muted hover:text-ink">
            Events
          </Link>
        </div>
      </div>
    </footer>
  )
}
