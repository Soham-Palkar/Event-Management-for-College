import { useEffect, useMemo, useState } from 'react'
import { CalendarOff } from 'lucide-react'
import CategoryFilter from '../components/CategoryFilter'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import EventGrid from '../components/EventGrid'
import SearchBar from '../components/SearchBar'
import { getEvents } from '../services/api'
import type { Event } from '../types'

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

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

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return events.filter((event) => {
      const matchesName = event.name.toLowerCase().includes(search)
      const matchesCategory = category === 'All' || event.category === category
      return matchesName && matchesCategory
    })
  }, [events, query, category])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:py-12">
      <h1 className="text-3xl font-bold text-ink">Upcoming Events</h1>
      <p className="mt-2 text-muted">
        Discover events happening on campus.
      </p>

      <div className="mt-8 space-y-4">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorMessage message="Unable to load events." onRetry={loadEvents} />
        ) : !loading && filtered.length === 0 ? (
          <EmptyState
            title="No events found"
            message="Try changing your search or category filter."
            actionLabel="Clear Filters"
            onAction={() => { setQuery(''); setCategory('All') }}
            icon={<CalendarOff className="h-8 w-8" />}
          />
        ) : (
          <EventGrid events={filtered} loading={loading} />
        )}
      </div>
    </div>
  )
}
