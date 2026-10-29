import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { formatMoney, formatMoneyCompact } from '@/lib/money'
import type { DashboardSummary } from '@/types/api'

interface Props {
  data: DashboardSummary['chartData']
  bucket: DashboardSummary['bucket']
  showProfit: boolean
}

const REVENUE = 'hsl(var(--primary))'
const PROFIT  = '#059669'   // tailwind `profit`

/** "2026-10-28T14" → "2 PM";  "2026-10-28" → "28 Oct";  "2026-10" → "Oct 26" (keys are already IST) */
function bucketLabel(key: string, bucket: Props['bucket']) {
  if (bucket === 'hour') {
    const h = Number(key.slice(11, 13))
    return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`
  }
  const [y, m, d = 1] = key.split('-').map(Number)
  const opts: Intl.DateTimeFormatOptions = bucket === 'month'
    ? { month: 'short', year: '2-digit', timeZone: 'UTC' }
    : { day: 'numeric', month: 'short', timeZone: 'UTC' }
  return new Intl.DateTimeFormat('en-IN', opts).format(new Date(Date.UTC(y, m - 1, d)))
}

const TITLE: Record<Props['bucket'], string> = {
  hour:  'Revenue today',
  day:   'Daily revenue',
  month: 'Monthly revenue',
}

export function RevenueChart({ data, bucket, showProfit }: Props) {
  const points = data.map(p => ({ ...p, label: bucketLabel(p.date, bucket) }))
  const empty  = points.every(p => p.revenue === 0)

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold">{TITLE[bucket]}</h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <Legend color={REVENUE} label="Revenue" />
          {showProfit && <Legend color={PROFIT} label="Profit" />}
        </div>
      </div>

      <div className="relative h-56 md:h-64">
        {empty && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground z-10">
            No sales in this period yet
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={REVENUE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={REVENUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v: number) => formatMoneyCompact(v)}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))' }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                    <p className="font-semibold mb-1">{label}</p>
                    {payload.map(p => (
                      <p key={String(p.dataKey)} className="flex items-center gap-2 tabular-nums">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-muted-foreground">{p.dataKey === 'revenue' ? 'Revenue' : 'Profit'}</span>
                        <span className="ml-auto font-medium">{formatMoney(Number(p.value))}</span>
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            <Area type="monotone" dataKey="revenue" stroke={REVENUE} strokeWidth={2} fill="url(#revFill)" />
            {showProfit && (
              <Area type="monotone" dataKey="netProfit" stroke={PROFIT} strokeWidth={2} fill="none" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
