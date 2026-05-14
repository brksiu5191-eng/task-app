import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { FrequencyType, Priority, Task, ColorOption } from '../lib/types'
import { getTodayString } from '../lib/taskUtils'
import { ParentPicker } from './ParentPicker'

const ICONS = [
  '🏃', '🧘', '💪', '🚴', '🏊', '🤸', '⚽', '🏋️',
  '📚', '✍️', '🎯', '💡', '🎨', '🎵', '🎸', '📝',
  '🥗', '💊', '🍵', '💧', '🌿', '🛌', '🧹', '🛁',
  '💼', '💻', '📊', '📞', '✉️', '🗓️', '⏰', '💰',
  '🐕', '🌸', '🌞', '🌙', '⭐', '❤️', '🙏', '😊',
]

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']
const INTERVAL_OPTIONS = [
  { value: 1, label: '毎週' },
  { value: 2, label: '2週ごと' },
  { value: 3, label: '3週ごと' },
  { value: 4, label: '4週ごと' },
]
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bg: string; flag: string }[] = [
  { value: 'high',   label: '高い', color: '#ef4444', bg: '#fef2f2', flag: '🚩' },
  { value: 'medium', label: '中',   color: '#f59e0b', bg: '#fffbeb', flag: '🟡' },
  { value: 'low',    label: '低い', color: '#22c55e', bg: '#f0fdf4', flag: '🟢' },
]

interface Props {
  onSave: (data: Omit<Task, 'id' | 'created_at'>) => void
  onCancel: () => void
  initial?: Task
  initialParent?: Task | null   // 呼び出し元から渡す初期親（＋ボタン経由など）
  allTasks: Task[]
  colors: ColorOption[]
}

export function TaskForm({ onSave, onCancel, initial, initialParent, allTasks, colors }: Props) {
  // 初期親の解決: 編集時は initial.parent_id から、新規は initialParent から
  const resolveInitialParent = (): Task | null => {
    if (initial?.parent_id) {
      return allTasks.find(t => t.id === initial.parent_id) ?? null
    }
    return initialParent ?? null
  }

  const [title, setTitle] = useState(initial?.title ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [parentTask, setParentTask] = useState<Task | null>(resolveInitialParent)
  const [frequency, setFrequency] = useState<FrequencyType>(
    initial?.frequency ?? initialParent?.frequency ?? 'daily'
  )
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initial?.days_of_week ?? initialParent?.days_of_week ?? [1]
  )
  const [intervalWeeks, setIntervalWeeks] = useState(
    initial?.interval_weeks ?? initialParent?.interval_weeks ?? 1
  )
  const [startDate, setStartDate] = useState(initial?.start_date ?? getTodayString())
  const [color, setColor] = useState(
    initial?.color ?? initialParent?.color ?? (colors[0]?.hex ?? '#6366f1')
  )
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showParentPicker, setShowParentPicker] = useState(false)

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const isCustom = frequency === 'custom'
    onSave({
      parent_id: parentTask?.id ?? null,
      title: title.trim(),
      icon,
      priority,
      frequency,
      days_of_week: isCustom ? daysOfWeek : [],
      interval_weeks: isCustom ? intervalWeeks : 1,
      start_date: startDate,
      color,
      is_active: true,
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-800">
              {initial ? 'タスクを編集' : '新しいタスク'}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-5 space-y-5">

            {/* アイコン＋タスク名 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">タスク名</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIconPicker(v => !v)}
                  className="shrink-0 w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-2xl hover:bg-gray-50 transition-colors"
                >
                  {icon || '＋'}
                </button>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit()
                  }}
                  placeholder="タスク名を入力..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                />
              </div>
              {showIconPicker && (
                <div className="mt-2 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="grid grid-cols-8 gap-1">
                    <button
                      onClick={() => { setIcon(''); setShowIconPicker(false) }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs text-gray-400 border transition-colors ${
                        icon === '' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent hover:bg-white'
                      }`}
                    >
                      なし
                    </button>
                    {ICONS.map(e => (
                      <button
                        key={e}
                        onClick={() => { setIcon(e); setShowIconPicker(false) }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-colors ${
                          icon === e ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'hover:bg-white'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 所属（親タスク） */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">所属カテゴリー</label>
              <button
                onClick={() => setShowParentPicker(true)}
                className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                {parentTask ? (
                  <>
                    {parentTask.icon && <span className="text-lg leading-none">{parentTask.icon}</span>}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: parentTask.color }}
                    />
                    <span className="flex-1 text-sm text-gray-800">{parentTask.title}</span>
                  </>
                ) : (
                  <span className="flex-1 text-sm text-gray-400">なし（トップレベル）</span>
                )}
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </button>
            </div>

            {/* 優先度 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">優先度</label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map(({ value, label, color: c, bg, flag }) => (
                  <button
                    key={value}
                    onClick={() => setPriority(value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      priority === value ? 'border-current' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                    style={priority === value ? { color: c, backgroundColor: bg, borderColor: c } : {}}
                  >
                    <span>{flag}</span><span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 開始日 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
              />
            </div>

            {/* 繰り返し */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">繰り返し</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['daily', '毎日'],
                  ['weekdays', '平日（月〜金）'],
                  ['weekends', '週末（土・日）'],
                  ['custom', '曜日を選ぶ'],
                ] as [FrequencyType, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFrequency(val)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                      frequency === val
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {frequency === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">曜日</label>
                  <div className="flex gap-1.5">
                    {DAY_NAMES.map((name, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          daysOfWeek.includes(i)
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">頻度</label>
                  <div className="grid grid-cols-4 gap-2">
                    {INTERVAL_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setIntervalWeeks(value)}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          intervalWeeks === value
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* カラー */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">カラー</label>
              <div className="flex gap-3 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.hex)}
                    title={c.label || c.hex}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                      color === c.hex ? 'border-gray-400 bg-gray-50' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.label && <span className="text-sm text-gray-600">{c.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-5 pt-0">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || (frequency === 'custom' && daysOfWeek.length === 0)}
              className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {initial ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </div>

      {/* 親タスク選択モーダル */}
      {showParentPicker && (
        <ParentPicker
          tasks={allTasks}
          currentTaskId={initial?.id}
          selectedId={parentTask?.id ?? null}
          onSelect={task => { setParentTask(task); setShowParentPicker(false) }}
          onClose={() => setShowParentPicker(false)}
        />
      )}
    </>
  )
}
