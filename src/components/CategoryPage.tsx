import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Task, ColorOption } from '../lib/types'

const PRIORITY_FLAG: Record<string, string> = { high: '🚩', medium: '🟡', low: '🟢' }
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) =>
    (PRIORITY_ORDER[a.priority ?? 'medium'] ?? 1) - (PRIORITY_ORDER[b.priority ?? 'medium'] ?? 1)
  )
}

interface NodeProps {
  task: Task
  allTasks: Task[]
  depth: number
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAddChild: (parent: Task) => void
}

function CategoryNode({ task, allTasks, depth, onEdit, onDelete, onAddChild }: NodeProps) {
  const children = sortTasks(allTasks.filter(t => t.parent_id === task.id && t.is_active))
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <div
        className="flex items-center gap-2 group"
        style={{ paddingLeft: depth * 20 }}
      >
        {/* 展開ボタン */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-6 h-6 flex items-center justify-center shrink-0 text-gray-300 hover:text-gray-500"
        >
          {children.length > 0
            ? (expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)
            : <span className="w-1.5 h-1.5 rounded-full bg-gray-200 inline-block" />}
        </button>

        {/* カード */}
        <div
          className="flex-1 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors min-w-0"
          style={{ borderLeft: `3px solid ${task.color}` }}
        >
          {task.icon && <span className="text-lg leading-none shrink-0">{task.icon}</span>}
          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{task.title}</span>
          <span className="text-xs shrink-0">{PRIORITY_FLAG[task.priority ?? 'medium']}</span>
          {children.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
              {children.length}
            </span>
          )}
        </div>

        {/* アクションボタン（hover時） */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onAddChild(task)}
            className="w-7 h-7 flex items-center justify-center hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-500 transition-colors text-base font-bold"
            title="サブタスクを追加"
          >
            +
          </button>
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 子タスク */}
      {expanded && children.length > 0 && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-150"
            style={{ left: depth * 20 + 11 }}
          />
          {children.map(child => (
            <CategoryNode
              key={child.id}
              task={child}
              allTasks={allTasks}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  tasks: Task[]
  colors: ColorOption[]
  onAddRoot: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAddChild: (parent: Task) => void
}

export function CategoryPage({ tasks, colors: _colors, onAddRoot, onEdit, onDelete, onAddChild }: Props) {
  const activeTasks = tasks.filter(t => t.is_active)
  const roots = sortTasks(activeTasks.filter(t => !t.parent_id))

  const totalCount = activeTasks.length
  const rootCount = roots.length

  return (
    <div className="space-y-4">
      {/* ヘッダー情報 */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">カテゴリー管理</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {rootCount} カテゴリー · 計 {totalCount} タスク
          </p>
        </div>
        <button
          onClick={onAddRoot}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          新しいカテゴリー
        </button>
      </div>

      {/* ツリー */}
      {roots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">🗂️</div>
          <p className="text-gray-500 font-medium">カテゴリーがありません</p>
          <p className="text-gray-400 text-sm mt-1">「新しいカテゴリー」から追加しましょう</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm px-3 py-2 space-y-0.5">
          {roots.map(task => (
            <CategoryNode
              key={task.id}
              task={task}
              allTasks={activeTasks}
              depth={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}

      {/* 凡例 */}
      {roots.length > 0 && (
        <div className="flex justify-center gap-4 pb-2">
          {[['high','🚩 高'], ['medium','🟡 中'], ['low','🟢 低']].map(([p, label]) => (
            <span key={p} className="text-xs text-gray-400">{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
