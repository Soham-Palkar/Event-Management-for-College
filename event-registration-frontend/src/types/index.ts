export interface Event {
  id: number
  name: string
  description: string
  date: string
  time: string
  venue: string
  capacity: number
  registeredCount: number
  category: string
  image?: string
}

export interface Registration {
  id: number
  eventId: number
  name: string
  email: string
  studentId: string
  registeredAt: string
}

export interface RegistrationPayload {
  name: string
  email: string
  studentId: string
}

export interface CreateEventPayload {
  name: string
  description: string
  date: string
  time: string
  venue: string
  capacity: number
  category: string
  /** URL returned by backend after upload – NOT used when creating */
  image?: string
  /** File selected by admin for upload */
  imageFile?: File
}

export interface AdminLoginPayload {
  adminId: string
  password: string
}

export type ApiErrorCode =
  | 'DUPLICATE_REGISTRATION'
  | 'EVENT_FULL'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'UNKNOWN'

export class ApiError extends Error {
  status: number
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export const EVENT_CATEGORIES = [
  'Technical',
  'Cultural',
  'Workshop',
  'Sports',
  'Seminar',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]
