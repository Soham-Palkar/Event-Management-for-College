import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import ErrorMessage from '../../components/ErrorMessage'
import Input from '../../components/Input'
import { createEvent } from '../../services/api'
import { EVENT_CATEGORIES } from '../../types'

type FieldErrors = {
  name?: string
  description?: string
  date?: string
  time?: string
  venue?: string
  capacity?: string
  category?: string
}

export default function AddEvent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [capacity, setCapacity] = useState('')
  const [category, setCategory] = useState('Technical')
  const [image, setImage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(false)

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Please enter the event name.'
    if (!description.trim()) next.description = 'Please enter a description.'
    if (!date) next.date = 'Please select a date.'
    if (!time) next.time = 'Please select a time.'
    if (!venue.trim()) next.venue = 'Please enter a venue.'
    const seats = Number(capacity)
    if (!capacity.trim() || Number.isNaN(seats) || seats < 1) {
      next.capacity = 'Please enter a valid capacity.'
    }
    if (!category) next.category = 'Please select a category.'
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setFormError(false)
    try {
      await createEvent({
        name,
        description,
        date,
        time,
        venue,
        capacity: Number(capacity),
        category,
        image,
      })
      navigate('/admin/events')
    } catch {
      setFormError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Add Event</h1>
      <p className="mt-1 text-sm text-muted">Create a new campus event for students to register.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        {formError ? (
          <ErrorMessage message="Something went wrong. Please try again." />
        ) : null}

        <fieldset className="space-y-4 rounded-xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Event details</legend>
          <Input
            label="Event Name *"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            disabled={submitting}
          />
          <Input
            multiline
            label="Description *"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={errors.description}
            disabled={submitting}
          />
          <div>
            <label htmlFor="event-category" className="mb-1.5 block text-sm font-medium text-ink">
              Category
            </label>
            <select
              id="event-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm"
            >
              {EVENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="mt-1 text-xs font-medium text-danger">{errors.category}</p>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Schedule and venue</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date *"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              error={errors.date}
              disabled={submitting}
            />
            <Input
              label="Time *"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              error={errors.time}
              disabled={submitting}
            />
          </div>
          <Input
            label="Venue *"
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
            error={errors.venue}
            disabled={submitting}
          />
          <Input
            label="Capacity *"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            error={errors.capacity}
            disabled={submitting}
          />
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Event image</legend>
          <Input
            label="Image URL"
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            hint="Enter an image URL or leave blank for default image."
            disabled={submitting}
          />
          {image ? (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium text-muted">Preview:</p>
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-line bg-slate-100">
                <img
                  src={image}
                  alt="Event preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // fallback if invalid url
                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/events')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
