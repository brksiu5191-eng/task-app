import type { Task } from './types'

// 固定エポック（2000-01-03 月曜日）からの7日単位インデックスを返す。
// 曜日正規化に依存しないため、どの曜日のタスクでも一貫した隔週判定が可能。
const EPOCH_MS = Date.UTC(2000, 0, 3) // 2000-01-03 00:00:00 UTC (Monday)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function epochWeekIndex(dateStr: string): number {
  const d = Date.UTC(
    parseInt(dateStr.slice(0, 4)),
    parseInt(dateStr.slice(5, 7)) - 1,
    parseInt(dateStr.slice(8, 10)),
  )
  return Math.floor((d - EPOCH_MS) / WEEK_MS)
}

export function shouldShowOnDate(task: Task, dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00')
  const dow = date.getDay()

  switch (task.frequency) {
    case 'daily':    return true
    case 'weekdays': return dow >= 1 && dow <= 5
    case 'weekends': return dow === 0 || dow === 6
    case 'custom': {
      if (!task.days_of_week.includes(dow)) return false
      const interval = task.interval_weeks ?? 1
      if (interval <= 1) return true
      // エポック週インデックスの差がintervalの倍数かどうかで判定
      const diff = epochWeekIndex(dateStr) - epochWeekIndex(task.start_date)
      return diff >= 0 && diff % interval === 0
    }
  }
}

export function shouldShowToday(task: Task): boolean {
  return shouldShowOnDate(task, getTodayString())
}

export function getFrequencyLabel(task: Task): string {
  const names = ['日', '月', '火', '水', '木', '金', '土']
  switch (task.frequency) {
    case 'daily':    return '毎日'
    case 'weekdays': return '平日（月〜金）'
    case 'weekends': return '週末（土・日）'
    case 'custom': {
      const days = task.days_of_week.map(d => names[d]).join('・')
      const interval = task.interval_weeks ?? 1
      const intervalLabel = interval === 1 ? '毎週' : `${interval}週ごと`
      return days ? `${intervalLabel} ${days}` : 'カスタム（曜日未設定）'
    }
  }
}

export function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
