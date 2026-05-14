import { useState, useEffect, useCallback } from 'react'
import { Plus, Settings } from 'lucide-react'
import type { Task, TaskCompletion, ColorOption } from '../lib/types'
import { loadTasks, saveTasks, loadCompletions, loadColors, createTask, toggleCompletion } from '../lib/storage'
import { shouldShowToday, getTodayString } from '../lib/taskUtils'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { CalendarView } from './CalendarView'
import { CategoryPage } from './CategoryPage'
import { SettingsPage } from './SettingsPage'

const DAY_LABELS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

type Tab = 'today' | 'calendar' | 'category'

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [colors, setColors] = useState<ColorOption[]>(loadColors)
  const [tab, setTab] = useState<Tab>('today')
  const [showSettings, setShowSettings] = useState(false)

  // フォーム状態
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [initialParent, setInitialParent] = useState<Task | null>(null)

  const today = getTodayString()
  const now = new Date()
  const dateLabel = `${now.getFullYear()}年${MONTH_LABELS[now.getMonth()]}${now.getDate()}日（${DAY_LABELS[now.getDay()]}）`

  const refresh = useCallback(() => {
    setTasks(loadTasks().filter(t => t.is_active))
    setCompletions(loadCompletions())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const todayTasks = tasks
    .filter(t => shouldShowToday(t))
    .sort((a, b) => (PRIORITY_ORDER[a.priority ?? 'medium'] ?? 1) - (PRIORITY_ORDER[b.priority ?? 'medium'] ?? 1))

  const todayCompletedIds = new Set(
    completions.filter(c => c.completed_date === today).map(c => c.task_id)
  )
  const doneCount = todayTasks.filter(t => todayCompletedIds.has(t.id)).length
  const progress = todayTasks.length > 0 ? (doneCount / todayTasks.length) * 100 : 0

  const handleToggle = (task: Task) => {
    setCompletions(toggleCompletion(task.id, today))
  }

  const openNew = (parent: Task | null = null) => {
    setEditingTask(null)
    setInitialParent(parent)
    setShowForm(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setInitialParent(null)
    setShowForm(true)
  }

  const handleSave = (data: Omit<Task, 'id' | 'created_at'>) => {
    const all = loadTasks()
    if (editingTask) {
      const idx = all.findIndex(t => t.id === editingTask.id)
      if (idx >= 0) all[idx] = { ...all[idx], ...data }
    } else {
      all.push(createTask(data))
    }
    saveTasks(all)
    setShowForm(false)
    setEditingTask(null)
    setInitialParent(null)
    refresh()
  }

  const handleDelete = (task: Task) => {
    const all = loadTasks()
    const directChildren = all.filter(t => t.parent_id === task.id && t.is_active)

    if (directChildren.length > 0) {
      const choice = window.confirm(
        `「${task.title}」を削除します。\n\nOK → サブタスクをトップレベルに移動\nキャンセル → 削除を中止`
      )
      if (!choice) return
      // 直接の子だけ parent_id を null に（孫以下はそのまま親子関係を保つ）
      saveTasks(all.map(t => {
        if (t.id === task.id) return { ...t, is_active: false }
        if (t.parent_id === task.id) return { ...t, parent_id: task.parent_id ?? null }
        return t
      }))
    } else {
      if (!confirm(`「${task.title}」を削除しますか？`)) return
      saveTasks(all.map(t => t.id === task.id ? { ...t, is_active: false } : t))
    }
    refresh()
  }

  if (showSettings) {
    return (
      <SettingsPage
        colors={colors}
        onColorsChange={setColors}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today', label: '今日' },
    { key: 'calendar', label: 'カレンダー' },
    { key: 'category', label: 'カテゴリー' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            <Settings size={22} />
          </button>
        </div>

        {/* 進捗カード（今日タブのみ） */}
        {tab === 'today' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">今日の進捗</p>
              <span className="text-sm font-semibold text-indigo-600">{doneCount} / {todayTasks.length} 完了</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && todayTasks.length > 0 && (
              <p className="text-center text-sm text-indigo-500 font-medium mt-3">🎉 全部完了！お疲れさまでした！</p>
            )}
          </div>
        )}

        {/* タブ */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-4">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        {tab === 'calendar' && (
          <CalendarView tasks={tasks} completions={completions} onCompletionsChange={setCompletions} />
        )}

        {tab === 'category' && (
          <CategoryPage
            tasks={tasks}
            colors={colors}
            onAddRoot={() => openNew(null)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddChild={parent => openNew(parent)}
          />
        )}

        {tab === 'today' && (
          todayTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-500 font-medium">今日のタスクはありません</p>
              <p className="text-gray-400 text-sm mt-1">＋ボタンから追加しましょう</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={todayCompletedIds.has(task.id)}
                  onToggle={() => handleToggle(task)}
                  onEdit={() => openEdit(task)}
                  onDelete={() => handleDelete(task)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => openNew(null)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
      >
        <Plus size={28} />
      </button>

      {/* タスクフォーム */}
      {showForm && (
        <TaskForm
          initial={editingTask ?? undefined}
          initialParent={initialParent}
          allTasks={tasks}
          colors={colors}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTask(null); setInitialParent(null) }}
        />
      )}
    </div>
  )
}
