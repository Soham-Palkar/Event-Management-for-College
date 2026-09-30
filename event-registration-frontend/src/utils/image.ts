import { API_BASE_URL } from '../services/api'

/**
 * Derive the backend origin (e.g. http://localhost:5000 from http://localhost:5000/api)
 */
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

/**
 * Fallback event image when no image is uploaded or URL fails to load.
 */
export const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'

/**
 * Centralized helper to resolve event image URLs.
 *
 * Rules:
 * 1. Undefined / empty -> Returns fallback placeholder
 * 2. External URL (http:// or https://) -> Returns URL unchanged
 * 3. Browser blob / data URL -> Returns URL unchanged
 * 4. Backend-relative path (/uploads/events/...) -> Prepends backend origin (http://localhost:5000)
 * 5. Anything else -> Returns as-is
 */
export function getImageUrl(image?: string | null): string {
  if (!image || !image.trim()) {
    return DEFAULT_EVENT_IMAGE
  }

  const trimmed = image.trim()

  // External URL or local browser object/data URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  // Backend relative upload path
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return `${BACKEND_ORIGIN}${normalizedPath}`
  }

  return trimmed
}
