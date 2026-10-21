import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

interface Props {
  paise: number
  className?: string
  /** Show in green if positive profit */
  asProfit?: boolean
  /** Show explicit +/- sign */
  signed?: boolean
}

export function MoneyText({ paise, className, asProfit, signed }: Props) {
  const text = signed
    ? (paise >= 0 ? '+' : '-') + formatMoney(Math.abs(paise)).replace('₹', '₹')
    : formatMoney(paise)

  return (
    <span
      className={cn(
        'tabular-nums',
        asProfit && paise >= 0 && 'text-profit',
        asProfit && paise < 0 && 'text-destructive',
        className,
      )}
    >
      {text}
    </span>
  )
}
