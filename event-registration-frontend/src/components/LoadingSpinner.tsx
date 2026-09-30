import { LoaderCircle } from 'lucide-react'

type LoadingSpinnerProps = {
  label?: string
  className?: string
}

export default function LoadingSpinner({
  label = 'Loading...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-muted ${className}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="h-7 w-7 animate-spin text-brand" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}
