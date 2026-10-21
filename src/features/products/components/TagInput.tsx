import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  label:    string
  value:    string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ label, value, onChange }: Props) {
  const [input, setInput] = useState('')

  const add = () => {
    const tag = input.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-lg bg-background min-h-[42px] focus-within:ring-1 focus-within:ring-primary">
        {value.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter(t => t !== tag))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length === 0 ? 'Type and press Enter…' : ''}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
