import { useState } from 'react'
import type { FormEvent } from 'react'
import type { RegistrationPayload } from '../types'
import Button from './Button'
import Input from './Input'

type RegistrationFormProps = {
  submitting: boolean
  onSubmit: (data: RegistrationPayload) => void
}

type FieldErrors = {
  name?: string
  email?: string
  studentId?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegistrationForm({
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!name.trim()) {
      next.name = 'Please enter your full name.'
    }
    if (!email.trim() || !emailPattern.test(email.trim())) {
      next.email = 'Please enter a valid email address.'
    }
    if (!studentId.trim()) {
      next.studentId = 'Please enter your student ID.'
    }
    return next
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Full Name *"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        disabled={submitting}
      />
      <Input
        label="Email Address *"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        disabled={submitting}
      />
      <Input
        label="Student ID *"
        name="studentId"
        autoComplete="off"
        value={studentId}
        onChange={(event) => setStudentId(event.target.value)}
        error={errors.studentId}
        disabled={submitting}
      />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Registering...' : 'Complete Registration'}
      </Button>
    </form>
  )
}
