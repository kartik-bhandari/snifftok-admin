import { Globe, MessageCircle, UserCog } from 'lucide-react'
import type { DashboardSummary } from '@/types/api'

const CHANNELS = [
  { key: 'web',      label: 'Website',  Icon: Globe },
  { key: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { key: 'admin',    label: 'Admin',    Icon: UserCog },
] as const

export function ChannelSplit({ byChannel }: { byChannel: DashboardSummary['byChannel'] }) {
  const total = byChannel.web + byChannel.whatsapp + byChannel.admin

  return (
    <section className="bg-card rounded-2xl border border-border p-4">
      <h2 className="text-sm font-semibold mb-3">Orders by channel</h2>
      <ul className="space-y-3">
        {CHANNELS.map(({ key, label, Icon }) => {
          const n = byChannel[key]
          return (
            <li key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />{label}
                </span>
                <span className="font-semibold tabular-nums">{n}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: total ? `${(n / total) * 100}%` : 0 }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
