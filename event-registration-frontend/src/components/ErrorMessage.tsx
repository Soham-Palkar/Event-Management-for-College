import Button from './Button'

type ErrorMessageProps = {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({
  title,
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-left"
      role="alert"
    >
      {title ? <p className="mb-1 text-sm font-semibold text-danger">{title}</p> : null}
      <p className="text-sm text-red-800">{message}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  )
}
