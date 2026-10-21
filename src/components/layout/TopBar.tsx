import { Sun, Moon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  title?: string
  onSearchClick?: () => void
}

export function TopBar({ title, onSearchClick }: Props) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('snifftok-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('snifftok-theme', 'light')
    }
  }, [dark])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4">
      {/* Mobile logo */}
      <span className="md:hidden font-wordmark text-xl tracking-widest">snifftok</span>

      {/* Title (desktop) */}
      {title && (
        <h1 className="hidden md:block text-base font-semibold flex-1">{title}</h1>
      )}

      <div className="flex-1 md:flex-none" />

      {/* Search trigger */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm min-w-[120px] hidden md:flex"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-auto text-[10px] font-mono bg-background border border-border rounded px-1">⌘K</kbd>
      </button>

      <button
        onClick={onSearchClick}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(d => !d)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  )
}
