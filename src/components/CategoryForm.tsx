import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, ColorOption } from '../lib/types'
import { getTodayString } from '../lib/taskUtils'

const ICONS = [
  '🏃', '🧘', '💪', '🚴', '🏊', '🤸', '⚽', '🏋️',
  '📚', '✍️', '🎯', '💡', '🎨', '🎵', '🎸', '📝',
  '🥗', '💊', '🍵', '💧', '🌿', '🛌', '🧹', '🛁',
  '💼', '💻', '📊', '📞', '✉️', '🗓️', '⏰', '💰',
  '🐕', '🌸', '🌞', '🌙', '⭐', '❤️', '🙏', '😊',
]

interface Props {
  onSave: (data: Omit<Task, 'id' | 'created_at'>) => void
  onCancel: () => void
  initial?: Task
  colors: ColorOption[]
}

export function CategoryForm({ onSave, onCancel, initial, colors }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '')
  const [color, setColor] = useState(initial?.color ?? (colors[0]?.hex ?? '#6366f1'))
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleSubmit = () => {
    if (!title.trim()) return
    onSave({
      parent_id:      initial?.parent_id ?? null,
      title:          title.trim(),
      icon,
      color,
      priority:       initial?.priority       ?? 'medium',
      frequency:      initial?.frequency      ?? 'daily',
      days_of_week:   initial?.days_of_week   ?? [],
      interval_weeks: initial?.interval_weeks ?? 1,
      start_date:     initial?.start_date     ?? getTodayString(),
      is_active:      true,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial ? 'カテゴリーを編集' : '新しいカテゴリー'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* アイコン＋名前 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">カテゴリー名</label>
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
                placeholder="例：仕事、健康、学習..."
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
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initial ? '保存' : '作成'}
          </button>
        </div>
      </div>
    </div>
  )
}
