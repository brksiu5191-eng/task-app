import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import type { Task, TaskCompletion } from '../lib/types'
import { shouldShowOnDate, dateToString, getFrequencyLabel } from '../lib/taskUtils'
import { toggleCompletion } from '../lib/storage'

const DOW_HEADERS = ['日', '月', '火', '水', '木', '金', '土']

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#22c55e',
}
const PRIORITY_FLAG: Record<string, string> = {
  high: '🚩', medium: '🟡', low: '🟢',
}

interface Props {
  tasks: Task[]
  completions: TaskCompletion[]
  onCompletionsChange: (completions: TaskCompletion[]) => void
}

export function CalendarView({ tasks, completions, onCompletionsChange }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const completedSet = new Set(completions.map(c => `${c.task_id}__${c.completed_date}`))

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = dateToString(today)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const getTasksForDate = (dateStr: string) =>
    tasks.filter(t => t.is_active && shouldShowOnDate(t, dateStr))

  const handleToggle = (taskId: string, dateStr: string) => {
    onCompletionsChange(toggleCompletion(taskId, dateStr))
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []
  const selectedDateLabel = selectedDate
    ? (() => {
        const d = new Date(selectedDate + 'T00:00:00')
        return `${d.getMonth() + 1}月${d.getDate()}日（${DOW_HEADERS[d.getDay()]}）`
      })()
    : ''

  return (
    <div className="space-y-4">
      {/* 月ナビ */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <span className="font-semibold text-gray-800 text-base">{year}年{month + 1}月</span>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DOW_HEADERS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}>{d}</div>
          ))}
        </div>

        {/* 日付セル */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-16 bg-gray-50/50" />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayTasks = getTasksForDate(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const allDone = dayTasks.length > 0 && dayTasks.every(t => completedSet.has(`${t.id}__${dateStr}`))

            // 優先度別に集計（high > medium > low の順）
            const byPriority = ['high', 'medium', 'low'].map(p => ({
              priority: p,
              tasks: dayTasks.filter(t => (t.priority ?? 'medium') === p),
            })).filter(g => g.tasks.length > 0)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`h-16 p-1 flex flex-col items-center transition-colors ${
                  isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-0.5 ${
                  isToday
                    ? 'bg-indigo-500 text-white'
                    : idx % 7 === 0 ? 'text-red-400'
                    : idx % 7 === 6 ? 'text-blue-400'
                    : 'text-gray-700'
                }`}>
                  {day}
                </span>

                {/* 優先度ドット（high=赤, medium=黄, low=緑） */}
                {dayTasks.length > 0 && (
                  <div className="flex justify-center gap-0.5 flex-wrap max-w-full">
                    {byPriority.slice(0, 3).map(({ priority, tasks: pts }) => {
                      const color = PRIORITY_COLOR[priority]
                      const doneCount = pts.filter(t => completedSet.has(`${t.id}__${dateStr}`)).length
                      const allGroupDone = doneCount === pts.length
                      return (
                        <span
                          key={priority}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: allGroupDone ? color : 'transparent',
                            border: `1.5px solid ${color}`,
                          }}
                        />
                      )
                    })}
                    {allDone && <span className="text-[9px] text-gray-400 leading-none ml-0.5">✓</span>}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex justify-center gap-4">
        {(['high', 'medium', 'low'] as const).map(p => (
          <div key={p} className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[p] }} />
            {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
          </div>
        ))}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-2.5 h-2.5 rounded-full border border-gray-300" />
          未完了
        </div>
      </div>

      {/* 選択日の詳細 */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800">{selectedDateLabel}</span>
            <button onClick={() => setSelectedDate(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {selectedDateTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">この日のタスクはありません</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedDateTasks.map(task => {
                const done = completedSet.has(`${task.id}__${selectedDate}`)
                const pColor = PRIORITY_COLOR[task.priority ?? 'medium']
                return (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderLeftColor: pColor, borderLeftWidth: 3 }}
                  >
                    <button
                      onClick={() => handleToggle(task.id, selectedDate)}
                      className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: task.color, backgroundColor: done ? task.color : 'transparent' }}
                    >
                      {done && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.icon && <span className="mr-1">{task.icon}</span>}
                          {task.title}
                        </p>
                        <span className="text-xs">{PRIORITY_FLAG[task.priority ?? 'medium']}</span>
                      </div>
                      <p className="text-xs text-gray-400">{getFrequencyLabel(task)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
