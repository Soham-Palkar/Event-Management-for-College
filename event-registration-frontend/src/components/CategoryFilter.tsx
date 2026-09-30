import { EVENT_CATEGORIES } from '../types'

type CategoryFilterProps = {
  value: string
  onChange: (value: string) => void
}

const options = ['All', ...EVENT_CATEGORIES]

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {options.map((category) => {
        const active = value === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-muted hover:border-brand hover:text-brand'
            }`}
            aria-pressed={active}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
