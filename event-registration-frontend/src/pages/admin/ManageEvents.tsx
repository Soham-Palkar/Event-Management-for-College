import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import EventTable from '../../components/admin/EventTable'
import Button from '../../components/Button'
import { deleteEvent, getEvents } from '../../services/api'
import type { Event } from '../../types'

export default function ManageEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  function loadEvents() {
    setLoading(true)
    setError(false)
    getEvents()
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handleDelete() {
    if (!selected) {
      return
    }
    setDeleting(true)
    try {
      await deleteEvent(selected.id)
      setEvents((current) => current.filter((event) => event.id !== selected.id))
      setSelected(null)
    } catch {
      setError(true)
      setSelected(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Events</h1>
          <p className="mt-1 text-sm text-muted">
            Create, manage and remove college events.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/events/add')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Event
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading events..." />
        ) : error ? (
          <ErrorMessage
            message="Unable to load events."
            onRetry={loadEvents}
          />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events yet"
            message="Create your first event to get started."
            actionLabel="Add Event"
            onAction={() => navigate('/admin/events/add')}
          />
        ) : (
          <EventTable events={events} onDelete={setSelected} />
        )}
      </div>

      <ConfirmModal
        open={Boolean(selected)}
        title="Delete Event?"
        message={
          selected
            ? `Are you sure you want to delete "${selected.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Event"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setSelected(null)
          }
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
