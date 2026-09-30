import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Input from '../components/Input'
import { adminLogin, isApiError } from '../services/api'
import { setAdminSession } from '../services/auth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ adminId?: string; password?: string }>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { adminId?: string; password?: string } = {}
    if (!adminId.trim()) {
      nextErrors.adminId = 'Please enter your admin ID.'
    }
    if (!password) {
      nextErrors.password = 'Please enter your password.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await adminLogin({ adminId: adminId.trim(), password })
      setAdminSession()
      navigate('/admin/dashboard')
    } catch (err) {
      if (isApiError(err) && err.code === 'UNAUTHORIZED') {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Website
        </Link>
        <div className="rounded-xl border border-line bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-ink">Admin Login</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage events and registrations.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error ? <ErrorMessage message={error} /> : null}
            <Input
              label="Admin ID"
              name="adminId"
              autoComplete="username"
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              error={fieldErrors.adminId}
              disabled={submitting}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password}
              disabled={submitting}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
