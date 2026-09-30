import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type SharedProps = {
  label: string
  error?: string
  hint?: string
}

type InputProps = SharedProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false
  }

type TextareaProps = SharedProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true
  }

const fieldClass =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400'

export default function Input(props: InputProps | TextareaProps) {
  const { label, error, hint, id, multiline, ...rest } = props
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
  const borderClass = error ? 'border-danger' : 'border-line focus:border-brand'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClass} min-h-28 resize-y ${borderClass}`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClass} ${borderClass}`}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
