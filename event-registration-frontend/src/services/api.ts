import { mockEvents, mockRegistrations } from '../data/mockEvents'
import type {
  AdminLoginPayload,
  ApiErrorCode,
  CreateEventPayload,
  Event,
  Registration,
  RegistrationPayload,
} from '../types'
import { ApiError } from '../types'
import { to12HourTime } from '../utils/format'

/**
 * Read from VITE_API_BASE_URL when backend is running;
 * default to http://localhost:5000/api
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

// Set VITE_USE_MOCK=true in .env to force mock mode
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const DELAY_MS = 450

/* ------------------------------------------------------------------ */
/*  In-memory mock store                                               */
/* ------------------------------------------------------------------ */

let events: Event[] = mockEvents.map((event) => ({ ...event }))
let registrations: Registration[] = mockRegistrations.map((item) => ({ ...item }))
let nextEventId = Math.max(...events.map((event) => event.id)) + 1
let nextRegistrationId = Math.max(...registrations.map((item) => item.id)) + 1

function wait(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/* ------------------------------------------------------------------ */
/*  HTTP helper (used when USE_MOCK === false)                         */
/* ------------------------------------------------------------------ */

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  let payload: unknown = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const body = payload as { code?: string; message?: string } | null
    throw new ApiError(
      (body?.code as ApiErrorCode) || 'UNKNOWN',
      body?.message || 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return payload as T
}

/* ------------------------------------------------------------------ */
/*  Public API functions                                               */
/* ------------------------------------------------------------------ */

export async function getEvents(): Promise<Event[]> {
  if (!USE_MOCK) {
    return request<Event[]>('/events')
  }

  await wait()
  return events.map((event) => ({ ...event }))
}

export async function getEvent(id: number): Promise<Event> {
  if (!USE_MOCK) {
    return request<Event>(`/events/${id}`)
  }

  await wait()
  const event = events.find((item) => item.id === id)
  if (!event) {
    throw new ApiError('NOT_FOUND', 'Event not found.', 404)
  }
  return { ...event }
}

export async function registerForEvent(
  eventId: number,
  data: RegistrationPayload,
): Promise<Registration> {
  if (!USE_MOCK) {
    return request<Registration>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, ...data }),
    })
  }

  await wait(700)

  const event = events.find((item) => item.id === eventId)
  if (!event) {
    throw new ApiError('NOT_FOUND', 'Event not found.', 404)
  }

  if (event.registeredCount >= event.capacity) {
    throw new ApiError('EVENT_FULL', 'This event is full. No seats available.', 409)
  }

  const email = data.email.trim().toLowerCase()
  const duplicate = registrations.some(
    (item) => item.eventId === eventId && item.email.toLowerCase() === email,
  )
  if (duplicate) {
    throw new ApiError(
      'DUPLICATE_REGISTRATION',
      'You are already registered for this event.',
      409,
    )
  }

  const registration: Registration = {
    id: nextRegistrationId,
    eventId,
    name: data.name.trim(),
    email,
    studentId: data.studentId.trim(),
    registeredAt: new Date().toISOString(),
  }
  nextRegistrationId += 1
  registrations = [...registrations, registration]
  events = events.map((item) =>
    item.id === eventId
      ? { ...item, registeredCount: item.registeredCount + 1 }
      : item,
  )
  return { ...registration }
}

export async function adminLogin(data: AdminLoginPayload): Promise<{ success: boolean }> {
  if (!USE_MOCK) {
    return request<{ success: boolean }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  await wait(600)

  const validId = data.adminId.trim() === 'ADMIN001'
  const validPassword = data.password === 'EventHub@2026'
  if (!validId || !validPassword) {
    throw new ApiError('UNAUTHORIZED', 'Invalid admin ID or password.', 401)
  }

  return { success: true }
}

/**
 * Create a new event.
 *
 * Supports both:
 * 1. Uploading a local File (via multipart FormData).
 * 2. Providing an external Image URL (via multipart FormData or JSON).
 */
export async function createEvent(data: CreateEventPayload): Promise<Event> {
  if (!USE_MOCK) {
    // Build FormData – do NOT manually set Content-Type header;
    // the browser automatically attaches the correct multipart boundary.
    const formData = new FormData()
    formData.append('name', data.name.trim())
    formData.append('description', data.description.trim())
    formData.append('category', data.category)
    formData.append('date', data.date)
    formData.append('time', data.time)
    formData.append('venue', data.venue.trim())
    formData.append('capacity', String(data.capacity))

    if (data.imageFile) {
      formData.append('image', data.imageFile)
    } else if (data.image && data.image.trim()) {
      formData.append('image', data.image.trim())
    }

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let payload: unknown = null
      const text = await response.text()
      if (text) {
        try {
          payload = JSON.parse(text) as unknown
        } catch {
          payload = null
        }
      }
      const body = payload as { code?: string; message?: string } | null
      throw new ApiError(
        (body?.code as ApiErrorCode) || 'UNKNOWN',
        body?.message || 'Failed to create event.',
        response.status,
      )
    }

    return (await response.json()) as Event
  }

  await wait(700)

  // For mock mode, create a local object URL from file or use image URL
  let imageUrl: string | undefined = data.image?.trim() || undefined
  if (data.imageFile) {
    imageUrl = URL.createObjectURL(data.imageFile)
  }

  const event: Event = {
    id: nextEventId,
    name: data.name.trim(),
    description: data.description.trim(),
    date: data.date,
    time: to12HourTime(data.time),
    venue: data.venue.trim(),
    capacity: data.capacity,
    registeredCount: 0,
    category: data.category,
    image: imageUrl,
  }
  nextEventId += 1
  events = [event, ...events]
  return { ...event }
}

export async function deleteEvent(id: number): Promise<void> {
  if (!USE_MOCK) {
    await request<void>(`/events/${id}`, { method: 'DELETE' })
    return
  }

  await wait(500)
  const exists = events.some((item) => item.id === id)
  if (!exists) {
    throw new ApiError('NOT_FOUND', 'Event not found.', 404)
  }
  events = events.filter((item) => item.id !== id)
  registrations = registrations.filter((item) => item.eventId !== id)
}

export async function getRegistrations(): Promise<Registration[]> {
  if (!USE_MOCK) {
    return request<Registration[]>('/registrations')
  }

  await wait()
  return registrations.map((item) => ({ ...item }))
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
