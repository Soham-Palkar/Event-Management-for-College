import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import RegistrationTable from '../../components/admin/RegistrationTable'
import { getEvents, getRegistrations } from '../../services/api'
import type { Event, Registration } from '../../types'

export default function Registrations() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventFilter, setEventFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadData() {
    setLoading(true)
    setError(false)
    Promise.all([getEvents(), getRegistrations()])
      .then(([eventList, registrationList]) => {
        setEvents(eventList)
        setRegistrations(registrationList)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    if (eventFilter === 'all') {
      return registrations
    }
    return registrations.filter((item) => String(item.eventId) === eventFilter)
  }, [registrations, eventFilter])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Registrations</h1>
      <div className="mt-4 max-w-xs">
        <label htmlFor="registration-event-filter" className="mb-1.5 block text-sm font-medium">
          Event
        </label>
        <select
          id="registration-event-filter"
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm"
        >
          <option value="all">All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading events..." />
        ) : error ? (
          <ErrorMessage
            message="Something went wrong. Please try again."
            onRetry={loadData}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No registrations yet."
            message="Registrations will appear here when students register."
          />
        ) : (
          <RegistrationTable registrations={filtered} events={events} />
        )}
      </div>
    </div>
  )
}
