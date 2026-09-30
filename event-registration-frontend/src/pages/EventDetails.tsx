import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { getEvent } from '../services/api'
import type { Event } from '../types'
import { availableSeats, formatLongDate } from '../utils/format'
import { DEFAULT_EVENT_IMAGE, getImageUrl } from '../utils/image'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadEvent() {
    const eventId = Number(id)
    if (!eventId) {
      setError(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    getEvent(eventId)
      .then(setEvent)
      .catch(() => {
        setEvent(null)
        setError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvent()
  }, [id])

  if (loading) {
    return <LoadingSpinner label="Loading event details..." />
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorMessage
          message="Unable to load event details."
          onRetry={loadEvent}
        />
      </div>
    )
  }

  const seats = availableSeats(event.capacity, event.registeredCount)
  const isFull = seats === 0

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* Event image */}
      <div className="overflow-hidden rounded-xl border border-line bg-slate-100">
        <img
          src={getImageUrl(event.image)}
          alt={event.name}
          className="h-64 w-full object-cover md:h-80"
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_EVENT_IMAGE) {
              e.currentTarget.src = DEFAULT_EVENT_IMAGE
            }
          }}
        />
      </div>

      {/* Category & Title */}
      <span className="mt-6 inline-block rounded-md bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
        {event.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold text-ink">{event.name}</h1>

      {/* Event info grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="h-4 w-4 text-brand" aria-hidden="true" />
            Date
          </div>
          <p className="mt-1 text-sm font-medium text-ink">{formatLongDate(event.date)}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
            Time
          </div>
          <p className="mt-1 text-sm font-medium text-ink">{event.time}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
            Venue
          </div>
          <p className="mt-1 text-sm font-medium text-ink">{event.venue}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Users className="h-4 w-4 text-brand" aria-hidden="true" />
            Seats
          </div>
          <p className="mt-1 text-sm font-medium text-ink">
            {seats} / {event.capacity}
          </p>
        </div>
      </div>

      {/* About section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">About the Event</h2>
        <hr className="mt-2 border-line" />
        <p className="mt-4 leading-7 text-muted">{event.description}</p>
      </section>

      {/* Registration status & CTA */}
      <div className="mt-8">
        {isFull ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="font-semibold text-danger">Registration Full</p>
            <p className="mt-1 text-sm text-red-700">
              All seats have been filled for this event.
            </p>
          </div>
        ) : (
          <Button
            className="w-full sm:w-auto px-8 py-3"
            onClick={() => navigate(`/events/${event.id}/register`)}
          >
            Register Now
          </Button>
        )}
      </div>
    </article>
  )
}
