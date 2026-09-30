import { CircleCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { formatLongDate } from '../utils/format'

type SuccessState = {
  eventName?: string
  date?: string
  time?: string
  venue?: string
  email?: string
}

export default function RegistrationSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as SuccessState

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:px-6">
      <div className="animate-fade-up rounded-xl border border-line bg-white px-6 py-12 shadow-sm">
        <div className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-success">
          <CircleCheck className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-ink">Registration Successful!</h1>
        <p className="mt-3 text-sm text-muted">You are successfully registered for:</p>
        <p className="mt-4 text-lg font-semibold text-ink">
          {state.eventName ?? 'your selected event'}
        </p>
        {state.date ? (
          <div className="mt-3 space-y-1 text-sm text-muted">
            <p>{formatLongDate(state.date)}</p>
            {state.time ? <p>{state.time}</p> : null}
            {state.venue ? <p>{state.venue}</p> : null}
          </div>
        ) : null}
        {state.email ? (
          <p className="mt-6 text-sm text-muted">
            A confirmation email has been sent to:
            <span className="mt-1 block font-medium text-ink">{state.email}</span>
          </p>
        ) : (
          <p className="mt-6 text-sm text-muted">
            A confirmation email has been sent to your registered address.
          </p>
        )}
        <Button className="mt-8" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    </div>
  )
}
