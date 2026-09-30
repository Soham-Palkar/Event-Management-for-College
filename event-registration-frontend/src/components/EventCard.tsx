import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Event } from '../types'
import { availableSeats, formatDisplayDate } from '../utils/format'
import Button from './Button'

type EventCardProps = {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate()
  const seats = availableSeats(event.capacity, event.registeredCount)
  const isFull = seats === 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-soft text-brand">
            <CalendarDays className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand backdrop-blur-sm">
          {event.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-ink">{event.name}</h3>

        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{formatDisplayDate(event.date)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{event.time}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{event.venue}</span>
          </li>
        </ul>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
          {event.description}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium">
          <Users className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          {isFull ? (
            <span className="text-danger">No seats available</span>
          ) : (
            <span className="text-ink">{seats} {seats === 1 ? 'seat' : 'seats'} available</span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <Button className="w-full" onClick={() => navigate(`/events/${event.id}`)}>
            View Details
          </Button>
        </div>
      </div>
    </article>
  )
}
