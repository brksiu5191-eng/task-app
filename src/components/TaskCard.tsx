import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../lib/types'
import { getFrequencyLabel } from '../lib/taskUtils'

const PRIORITY_FLAG: Record<string, { flag: string; color: string }> = {
  high:   { flag: '🚩', color: '#ef4444' },
  medium: { flag: '🟡', color: '#f59e0b' },
  low:    { flag: '🟢', color: '#22c55e' },
}

interface Props {
  task: Task
  completed: boolean
  depth?: number
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAddChild?: () => void
}

export function TaskCard({ task, completed, depth = 0, onToggle, onEdit, onDelete, onAddChild }: Props) {
  const pf = PRIORITY_FLAG[task.priority ?? 'medium']

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border transition-all duration-200 ${completed ? 'opacity-60' : ''}`}
      style={{ borderLeftColor: task.color, borderLeftWidth: 4, marginLeft: depth * 20 }}
    >
      <button
        onClick={onToggle}
        className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150"
        style={{ borderColor: task.color, backgroundColor: completed ? task.color : 'transparent' }}
      >
        {completed
          ? <Check size={14} className="text-white" strokeWidth={3} />
          : task.icon
          ? <span className="text-base leading-none">{task.icon}</span>
          : null}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-base font-medium leading-snug truncate ${completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
          <span className="text-sm shrink-0" title={`優先度: ${task.priority}`}>{pf.flag}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{getFrequencyLabel(task)}</p>
      </div>

      <div className="flex gap-1 shrink-0">
        {onAddChild && (
          <button
            onClick={onAddChild}
            className="p-2 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-500 transition-colors text-sm font-bold"
            title="サブタスクを追加"
          >
            +
          </button>
        )}
        <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
