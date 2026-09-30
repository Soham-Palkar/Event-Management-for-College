import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Users } from 'lucide-react'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/admin/StatCard'
import { getEvents, getRegistrations } from '../../services/api'
import type { Event } from '../../types'
import { formatDisplayDate } from '../../utils/format'

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrationCount, setRegistrationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadDashboard() {
    setLoading(true)
    setError(false)
    Promise.all([getEvents(), getRegistrations()])
      .then(([eventList, registrationList]) => {
        setEvents(eventList)
        setRegistrationCount(registrationList.length)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message="Unable to load dashboard data."
        onRetry={loadDashboard}
      />
    )
  }

  const totalSeats = events.reduce((sum, e) => sum + (e.capacity - e.registeredCount), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Overview of your college events and registrations.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Events"
          value={events.length}
          subtitle="Active events on platform"
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Total Registrations"
          value={registrationCount}
          subtitle="Across all events"
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Available Seats"
          value={totalSeats}
          subtitle="Remaining capacity"
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Recent Events</h2>
          <Link
            to="/admin/events"
            className="text-sm font-medium text-brand hover:underline"
          >
            View all →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No events yet.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-hidden rounded-xl border border-line bg-white md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-slate-50 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Venue</th>
                    <th className="px-4 py-3 font-medium">Registrations</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 6).map((event) => (
                    <tr key={event.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{event.name}</td>
                      <td className="px-4 py-3 text-muted">{formatDisplayDate(event.date)}</td>
                      <td className="px-4 py-3 text-muted">{event.venue}</td>
                      <td className="px-4 py-3 text-muted">
                        {event.registeredCount} / {event.capacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-4 space-y-3 md:hidden">
              {events.slice(0, 6).map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-line bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{event.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDisplayDate(event.date)} · {event.venue}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-muted">
                      {event.registeredCount} / {event.capacity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
