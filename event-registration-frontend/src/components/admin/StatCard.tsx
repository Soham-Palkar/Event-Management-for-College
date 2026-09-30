import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: number | string
  subtitle?: string
  icon?: ReactNode
}

export default function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  )
}
