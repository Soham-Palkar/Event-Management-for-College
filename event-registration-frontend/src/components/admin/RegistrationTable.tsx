import type { Event, Registration } from '../../types'
import { formatDateTime } from '../../utils/format'

type RegistrationTableProps = {
  registrations: Registration[]
  events: Event[]
}

export default function RegistrationTable({
  registrations,
  events,
}: RegistrationTableProps) {
  function eventName(eventId: number): string {
    return events.find((event) => event.id === eventId)?.name ?? 'Unknown event'
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-3 text-muted">{item.email}</td>
                <td className="px-4 py-3 text-muted">{item.studentId}</td>
                <td className="px-4 py-3 text-muted">{eventName(item.eventId)}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(item.registeredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {registrations.map((item) => (
          <div key={item.id} className="rounded-xl border border-line bg-white p-4">
            <p className="font-medium text-ink">{item.name}</p>
            <p className="mt-1 text-sm text-muted">{item.email}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span>ID: {item.studentId}</span>
              <span>{eventName(item.eventId)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Registered: {formatDateTime(item.registeredAt)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
