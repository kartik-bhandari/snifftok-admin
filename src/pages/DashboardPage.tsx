import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useAttention, useDashboardSummary } from '@/hooks/useDashboard'
import { MoneyText } from '@/components/MoneyText'
import { CardSkeleton } from '@/components/Skeletons'
import { ErrorState } from '@/components/States'
import { PeriodTabs } from '@/features/dashboard/components/PeriodTabs'
import { StatCard } from '@/features/dashboard/components/StatCard'
import { RevenueChart } from '@/features/dashboard/components/RevenueChart'
import { AttentionPanel } from '@/features/dashboard/components/AttentionPanel'
import { TopProducts } from '@/features/dashboard/components/TopProducts'
import { RecentOrders } from '@/features/dashboard/components/RecentOrders'
import { ChannelSplit } from '@/features/dashboard/components/ChannelSplit'
import { formatDate } from '@/lib/date'
import { formatMoney, formatMoneyCompact } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { DashboardPeriod, DashboardSummary } from '@/types/api'

const COMPARE_LABEL: Record<Exclude<DashboardPeriod, 'lifetime'>, string> = {
  today: 'vs yesterday',
  '7d':  'vs prior 7d',
  '30d': 'vs prior 30d',
  fy:    'vs last FY',
}

/** Text under each stat — lifetime has no comparison, so show where it starts */
function compareLabel(s: DashboardSummary) {
  return s.period === 'lifetime' ? `since ${formatDate(s.rangeStart)}` : COMPARE_LABEL[s.period]
}

/** ₹10 lakh and up won't fit a stat card — show "₹11.2L" with the full amount on hover */
const COMPACT_FROM = 10_00_000 * 100   // paise

function StatMoney({ paise, asProfit }: { paise: number; asProfit?: boolean }) {
  if (Math.abs(paise) < COMPACT_FROM) return <MoneyText paise={paise} asProfit={asProfit} />
  return (
    <span
      title={formatMoney(paise)}
      className={cn('tabular-nums', asProfit && (paise >= 0 ? 'text-profit' : 'text-destructive'))}
    >
      {formatMoneyCompact(paise)}
    </span>
  )
}

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('7d')
  const { user } = useAuth()
  const { canSeeCosts } = useRole()

  const summary   = useDashboardSummary(period)
  const attention = useAttention()
  const s = summary.data
  const compare = s ? compareLabel(s) : ''
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {greeting()}{firstName ? `, ${firstName}` : ''}. Here's how the store is doing{s?.period === 'fy' && s.label ? ` in ${s.label}` : ''}.
          </p>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* ── Stats + chart ───────────────────────────────────────── */}
      {summary.isError && !s ? (
        <div className="rounded-2xl border border-border bg-card">
          <ErrorState message={(summary.error as Error)?.message} onRetry={() => summary.refetch()} />
        </div>
      ) : !s ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="rounded-2xl" />)}
          </div>
          <div className="h-[300px] rounded-2xl border border-border bg-card animate-pulse" />
        </>
      ) : (
        <div className={summary.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Revenue"
              value={<StatMoney paise={s.revenue} />}
              current={s.revenue} previous={s.previous?.revenue ?? null}
              compareLabel={compare}
            />
            {canSeeCosts && s.netProfit != null ? (
              <StatCard
                label="Profit"
                value={<StatMoney paise={s.netProfit} asProfit />}
                current={s.netProfit} previous={s.previous ? s.previous.netProfit ?? 0 : null}
                compareLabel={compare}
                hint={s.profitMissingCost > 0
                  ? `${s.profitMissingCost} item${s.profitMissingCost === 1 ? '' : 's'} missing a cost price`
                  : undefined}
              />
            ) : (
              <StatCard
                label="Units sold"
                value={s.unitsSold.toLocaleString('en-IN')}
                current={s.unitsSold} previous={s.previous?.unitsSold ?? null}
                compareLabel={compare}
              />
            )}
            <StatCard
              label="Orders"
              value={s.orders.toLocaleString('en-IN')}
              current={s.orders} previous={s.previous?.orders ?? null}
              compareLabel={compare}
              hint={canSeeCosts ? `${s.unitsSold} unit${s.unitsSold === 1 ? '' : 's'} sold` : undefined}
            />
            <StatCard
              label="Avg. order value"
              value={<StatMoney paise={s.aov} />}
              current={s.aov} previous={s.previous?.aov ?? null}
              compareLabel={compare}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4 min-w-0">
          {s && <RevenueChart data={s.chartData} bucket={s.bucket} showProfit={canSeeCosts && s.netProfit != null} />}
          {s && <TopProducts products={s.topProducts} />}
        </div>
        <div className="space-y-4 min-w-0">
          <AttentionPanel
            items={attention.data?.items}
            isLoading={attention.isLoading}
            isError={attention.isError}
            onRetry={() => attention.refetch()}
          />
          <RecentOrders />
          {s && <ChannelSplit byChannel={s.byChannel} />}
        </div>
      </div>
    </div>
  )
}
