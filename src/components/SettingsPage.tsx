import { useState } from 'react'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import type { ColorOption } from '../lib/types'
import { saveColors, DEFAULT_COLORS } from '../lib/storage'

interface Props {
  colors: ColorOption[]
  onColorsChange: (colors: ColorOption[]) => void
  onBack: () => void
}

export function SettingsPage({ colors, onColorsChange, onBack }: Props) {
  const [editingColors, setEditingColors] = useState<ColorOption[]>(colors)
  const [newHex, setNewHex] = useState('#6366f1')
  const [newLabel, setNewLabel] = useState('')
  const update = (updated: ColorOption[]) => {
    setEditingColors(updated)
    saveColors(updated)
    onColorsChange(updated)
  }

  const updateLabel = (id: string, label: string) => {
    update(editingColors.map(c => c.id === id ? { ...c, label } : c))
  }

  const updateHex = (id: string, hex: string) => {
    update(editingColors.map(c => c.id === id ? { ...c, hex } : c))
  }

  const deleteColor = (id: string) => {
    if (editingColors.length <= 1) return
    update(editingColors.filter(c => c.id !== id))
  }

  const addColor = () => {
    if (editingColors.length >= 8) return
    update([...editingColors, { id: crypto.randomUUID(), hex: newHex, label: newLabel.trim() }])
    setNewLabel('')
  }

  const reset = () => {
    if (!confirm('デフォルトのカラーに戻しますか？')) return
    update([...DEFAULT_COLORS])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors">
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">設定</h1>
        </div>

        {/* カラー設定 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">カラー設定</h2>
            <p className="text-xs text-gray-400 mt-0.5">タスクに使うカラーとラベルを管理できます</p>
          </div>

          <div className="divide-y divide-gray-50">
            {editingColors.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                {/* 順番 */}
                <span className="text-xs text-gray-300 w-4 text-right shrink-0">{idx + 1}</span>

                {/* カラーピッカー */}
                <label className="shrink-0 cursor-pointer">
                  <div
                    className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: c.hex }}
                  />
                  <input
                    type="color"
                    value={c.hex}
                    onChange={e => updateHex(c.id, e.target.value)}
                    className="sr-only"
                  />
                </label>

                {/* 16進数表示 */}
                <span className="text-xs text-gray-400 font-mono w-16 shrink-0">{c.hex}</span>

                {/* ラベル入力 */}
                <input
                  value={c.label}
                  onChange={e => updateLabel(c.id, e.target.value)}
                  placeholder="ラベル（例：仕事、健康）"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {/* 削除 */}
                <button
                  onClick={() => deleteColor(c.id)}
                  disabled={editingColors.length <= 1}
                  className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* 新規追加 */}
          {editingColors.length < 8 && (
            <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-300 w-4 shrink-0" />

              <label className="shrink-0 cursor-pointer">
                <div
                  className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-gray-200 transition-transform hover:scale-110"
                  style={{ backgroundColor: newHex }}
                />
                <input
                  type="color"
                  value={newHex}
                  onChange={e => setNewHex(e.target.value)}
                  className="sr-only"
                />
              </label>

              <span className="text-xs text-gray-400 font-mono w-16 shrink-0">{newHex}</span>

              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) addColor()
                }}
                placeholder="ラベルを入力して追加..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />

              <button
                onClick={addColor}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* リセット */}
        <button
          onClick={reset}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-white transition-colors"
        >
          デフォルトに戻す
        </button>
      </div>
    </div>
  )
}
