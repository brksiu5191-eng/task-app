import { useState } from 'react'
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react'
import type { Task } from '../lib/types'

interface Props {
  tasks: Task[]
  currentTaskId?: string   // 編集中のタスク自身（選択不可）
  selectedId: string | null
  onSelect: (task: Task | null) => void
  onClose: () => void
}

// task とその全子孫の id を返す（visited セットで循環データにも安全）
function getDescendantIds(taskId: string, allTasks: Task[]): Set<string> {
  const ids = new Set<string>()
  const collect = (id: string) => {
    if (ids.has(id)) return   // 循環があっても無限ループしない
    ids.add(id)
    allTasks.filter(t => t.parent_id === id).forEach(c => collect(c.id))
  }
  collect(taskId)
  return ids
}

interface NodeProps {
  task: Task
  allTasks: Task[]
  disabledIds: Set<string>
  selectedId: string | null
  depth: number
  onSelect: (task: Task | null) => void
}

function PickerNode({ task, allTasks, disabledIds, selectedId, depth, onSelect }: NodeProps) {
  const children = allTasks.filter(t => t.parent_id === task.id && t.is_active)
  const [expanded, setExpanded] = useState(true)
  const disabled = disabledIds.has(task.id)
  const selected = selectedId === task.id

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
          disabled
            ? 'opacity-30 cursor-not-allowed'
            : selected
            ? 'bg-indigo-50'
            : 'hover:bg-gray-50 cursor-pointer'
        }`}
        style={{ paddingLeft: 16 + depth * 20 }}
        onClick={() => !disabled && onSelect(task)}
      >
        {/* 展開ボタン */}
        <span className="w-4 shrink-0 text-gray-300" onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
          {children.length > 0 && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>

        {/* アイコン */}
        {task.icon && <span className="text-base leading-none shrink-0">{task.icon}</span>}

        {/* カラーバー */}
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.color }} />

        {/* タスク名 */}
        <span className={`flex-1 text-sm ${selected ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}>
          {task.title}
        </span>

        {selected && <Check size={15} className="text-indigo-500 shrink-0" />}
      </div>

      {expanded && children.map(child => (
        <PickerNode
          key={child.id}
          task={child}
          allTasks={allTasks}
          disabledIds={disabledIds}
          selectedId={selectedId}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export function ParentPicker({ tasks, currentTaskId, selectedId, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')

  const disabledIds = currentTaskId ? getDescendantIds(currentTaskId, tasks) : new Set<string>()
  const activeTasks = tasks.filter(t => t.is_active)

  const roots = activeTasks.filter(t => !t.parent_id)

  // 検索中はフラットリスト表示
  const filtered = query
    ? activeTasks.filter(t => t.title.includes(query) && !disabledIds.has(t.id))
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-semibold text-gray-800">親タスクを選択</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 検索 */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="タスクを検索..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* リスト */}
        <div className="overflow-y-auto flex-1">
          {/* なし（トップレベル）*/}
          <div
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
              selectedId === null ? 'bg-indigo-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(null)}
          >
            <span className="text-sm text-gray-500 flex-1">なし（トップレベル）</span>
            {selectedId === null && <Check size={15} className="text-indigo-500" />}
          </div>

          {filtered ? (
            filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">見つかりません</p>
            ) : (
              filtered.map(t => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selectedId === t.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelect(t)}
                >
                  {t.icon && <span className="text-base">{t.icon}</span>}
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="flex-1 text-sm text-gray-700">{t.title}</span>
                  {selectedId === t.id && <Check size={15} className="text-indigo-500" />}
                </div>
              ))
            )
          ) : (
            roots.map(task => (
              <PickerNode
                key={task.id}
                task={task}
                allTasks={activeTasks}
                disabledIds={disabledIds}
                selectedId={selectedId}
                depth={0}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
