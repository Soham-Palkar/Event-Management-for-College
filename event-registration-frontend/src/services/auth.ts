const ADMIN_KEY = 'eventhub_admin'

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function setAdminSession(): void {
  sessionStorage.setItem(ADMIN_KEY, 'true')
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_KEY)
}
