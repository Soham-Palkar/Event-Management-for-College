import { Trash2 } from 'lucide-react'
import type { Event } from '../../types'
import { formatDisplayDate } from '../../utils/format'

type EventTableProps = {
  events: Event[]
  onDelete: (event: Event) => void
}

function statusBadge(registeredCount: number, capacity: number) {
  const ratio = registeredCount / capacity
  if (ratio >= 1) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-danger">
        Full
      </span>
    )
  }
  if (ratio >= 0.8) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-warning">
        Almost Full
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-success">
      Available
    </span>
  )
}

export default function EventTable({ events, onDelete }: EventTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">Registrations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{event.name}</td>
                <td className="px-4 py-3 text-muted">{formatDisplayDate(event.date)}</td>
                <td className="px-4 py-3 text-muted">{event.venue}</td>
                <td className="px-4 py-3 text-muted">
                  {event.registeredCount} / {event.capacity}
                </td>
                <td className="px-4 py-3">
                  {statusBadge(event.registeredCount, event.capacity)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onDelete(event)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-red-50"
                    aria-label={`Delete ${event.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-line bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{event.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDisplayDate(event.date)} · {event.venue}
                </p>
              </div>
              {statusBadge(event.registeredCount, event.capacity)}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted">
                {event.registeredCount} / {event.capacity} registered
              </p>
              <button
                type="button"
                onClick={() => onDelete(event)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-red-50"
                aria-label={`Delete ${event.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
