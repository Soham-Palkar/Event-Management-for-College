import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react'
import EventGrid from '../components/EventGrid'
import ErrorMessage from '../components/ErrorMessage'
import Button from '../components/Button'
import { getEvents } from '../services/api'
import type { Event } from '../types'
import { formatDisplayDate } from '../utils/format'

/**
 * These values are placeholders for the public landing page.
 * When the backend is ready, replace with data from a
 * dedicated /api/stats endpoint.
 */
const stats = [
  { value: '20+', label: 'Events' },
  { value: '500+', label: 'Registrations' },
  { value: '10+', label: 'Categories' },
]

export default function Home() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadEvents() {
    setLoading(true)
    setError(false)
    getEvents()
      .then((data) => {
        setEvents(data.slice(0, 4))
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Show the first event as the "Next on Campus" preview
  const nextEvent = events[0] ?? null

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold tracking-widest text-brand uppercase">
              College events
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
              Discover. Register.
              <br />
              Participate.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted">
              Find and register for upcoming college events, workshops, seminars
              and technical activities.
            </p>
            <Button
              className="mt-8 gap-2 px-6 py-3"
              onClick={() => navigate('/events')}
            >
              Explore Events
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Next on Campus card */}
          <div className="hidden rounded-2xl border border-line bg-slate-50 p-6 md:block lg:p-8">
            <div className="rounded-xl border border-line bg-white p-6">
              <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                Next on campus
              </p>
              <p className="mt-3 text-lg font-semibold text-ink">
                {nextEvent?.name ?? 'Tech Fest 2026'}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                <li className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {nextEvent ? formatDisplayDate(nextEvent.date) : '15 Oct 2026'}
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {nextEvent?.time ?? '10:00 AM'}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {nextEvent?.venue ?? 'College Auditorium'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Upcoming Events ─── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Upcoming Events</h2>
            <p className="mt-1 text-sm text-muted">
              Explore what's happening on campus.
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/events')}
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-8">
          {error ? (
            <ErrorMessage
              message="Unable to load events."
              onRetry={loadEvents}
            />
          ) : (
            <EventGrid events={events} loading={loading} />
          )}
        </div>
      </section>

      {/* ─── Statistics ─── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 md:px-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-3xl font-bold text-ink">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6">
        <h2 className="text-2xl font-semibold text-ink">Ready to participate?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Explore upcoming events and register today.
        </p>
        <Button className="mt-6" onClick={() => navigate('/events')}>
          Explore Events
        </Button>
      </section>
    </div>
  )
}
