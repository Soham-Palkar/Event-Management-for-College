export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function to12HourTime(value: string): string {
  if (value.includes('AM') || value.includes('PM')) {
    return value
  }

  const [hoursPart, minutesPart] = value.split(':')
  const hours = Number(hoursPart)
  const minutes = minutesPart ?? '00'
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${period}`
}

export function availableSeats(capacity: number, registeredCount: number): number {
  return Math.max(capacity - registeredCount, 0)
}
