import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import RegistrationForm from '../components/RegistrationForm'
import { getEvent, isApiError, registerForEvent } from '../services/api'
import type { Event, RegistrationPayload } from '../types'
import { availableSeats, formatLongDate } from '../utils/format'

export default function Register() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [formError, setFormError] = useState(false)

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
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvent()
  }, [id])

  async function handleSubmit(data: RegistrationPayload) {
    if (!event || submitting) {
      return
    }
    setSubmitting(true)
    setDuplicate(false)
    setFormError(false)
    try {
      await registerForEvent(event.id, data)
      navigate('/registration-success', {
        state: {
          eventName: event.name,
          date: event.date,
          time: event.time,
          venue: event.venue,
          email: data.email,
        },
      })
    } catch (err) {
      if (isApiError(err) && err.code === 'DUPLICATE_REGISTRATION') {
        setDuplicate(true)
      } else {
        setFormError(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading event..." />
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorMessage message="Unable to load event." onRetry={loadEvent} />
      </div>
    )
  }

  const isFull = availableSeats(event.capacity, event.registeredCount) === 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      {/* Event summary */}
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Register for
        </p>
        <h1 className="mt-2 text-xl font-semibold text-ink">{event.name}</h1>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {formatLongDate(event.date)}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {event.time}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {event.venue}
          </li>
        </ul>
      </div>

      {isFull ? (
        <div className="mt-6">
          <ErrorMessage
            title="Registration Full"
            message="This event has no seats remaining."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Your Details</h2>
          <p className="mt-1 text-sm text-muted">
            Fill in your information to complete registration.
          </p>
          <div className="mt-5">
            {duplicate ? (
              <div className="mb-4">
                <ErrorMessage
                  title="Already Registered"
                  message="You are already registered for this event."
                />
              </div>
            ) : null}
            {formError ? (
              <div className="mb-4">
                <ErrorMessage message="Something went wrong. Please try again." />
              </div>
            ) : null}
            <RegistrationForm submitting={submitting} onSubmit={handleSubmit} />
          </div>
        </div>
      )}
    </div>
  )
}
