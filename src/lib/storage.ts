import type { Task, TaskCompletion, ColorOption } from './types'

// ── キー ──────────────────────────────────────────────────────────────
const TASKS_KEY       = 'daily_tasks'
const COMPLETIONS_KEY = 'daily_completions'
const COLORS_KEY      = 'daily_colors'
const SCHEMA_KEY      = 'daily_schema_version'

// スキーマバージョンを上げたら migrate() にケースを追加する
const CURRENT_VERSION = 2

// ── デフォルトカラー ──────────────────────────────────────────────────
export const DEFAULT_COLORS: ColorOption[] = [
  { id: 'c1', hex: '#6366f1', label: 'デフォルト' },
  { id: 'c2', hex: '#ef4444', label: '重要' },
  { id: 'c3', hex: '#22c55e', label: '健康' },
]

// ── マイグレーション ──────────────────────────────────────────────────
function migrate(): void {
  const stored = parseInt(localStorage.getItem(SCHEMA_KEY) ?? '1', 10)
  if (stored >= CURRENT_VERSION) return

  if (stored < 2) {
    // v1 → v2: 旧タスクに不足フィールドを補完して保存し直す
    try {
      const raw: object[] = JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
      const today = new Date().toISOString().split('T')[0]
      const migrated = raw.map((t: any) => ({
        parent_id:      null,
        icon:           '',
        priority:       'medium',
        interval_weeks: 1,
        start_date:     t.created_at ? t.created_at.split('T')[0] : today,
        ...t,
      }))
      localStorage.setItem(TASKS_KEY, JSON.stringify(migrated))
    } catch { /* 既存データが壊れていても続行 */ }
  }

  localStorage.setItem(SCHEMA_KEY, String(CURRENT_VERSION))
}

// ── 完了履歴パージ（1年超を削除） ────────────────────────────────────
function purgeOldCompletions(): void {
  try {
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 1)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const raw: TaskCompletion[] = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) ?? '[]')
    const filtered = raw.filter(c => c.completed_date >= cutoffStr)
    if (filtered.length < raw.length) {
      localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filtered))
    }
  } catch { /* 無視 */ }
}

// ── 初期化（アプリ起動時に1回呼ぶ） ──────────────────────────────────
export function initStorage(): void {
  migrate()
  purgeOldCompletions()
}

// ── タスク ─────────────────────────────────────────────────────────────
export function loadTasks(): Task[] {
  try {
    const raw: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
    // マイグレーション済みでも実行時の型安全ガード
    return raw.map(t => ({
      ...t,
      parent_id:      t.parent_id      ?? null,
      icon:           t.icon           ?? '',
      priority:       t.priority       ?? 'medium' as const,
      interval_weeks: t.interval_weeks ?? 1,
      start_date:     t.start_date     ?? getTodayString(),
    }))
  } catch { return [] }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

// ── 完了履歴 ───────────────────────────────────────────────────────────
export function loadCompletions(): TaskCompletion[] {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) ?? '[]') } catch { return [] }
}

export function saveCompletions(completions: TaskCompletion[]): void {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions))
}

// ── カラー ─────────────────────────────────────────────────────────────
export function loadColors(): ColorOption[] {
  try {
    const raw = localStorage.getItem(COLORS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_COLORS
  } catch { return DEFAULT_COLORS }
}

export function saveColors(colors: ColorOption[]): void {
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
}

// ── タスク生成 ─────────────────────────────────────────────────────────
export function createTask(data: Omit<Task, 'id' | 'created_at'>): Task {
  return { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() }
}

// ── 完了トグル ─────────────────────────────────────────────────────────
export function toggleCompletion(taskId: string, date: string): TaskCompletion[] {
  const completions = loadCompletions()
  const idx = completions.findIndex(c => c.task_id === taskId && c.completed_date === date)
  if (idx >= 0) completions.splice(idx, 1)
  else completions.push({ id: crypto.randomUUID(), task_id: taskId, completed_date: date })
  saveCompletions(completions)
  return completions
}

// taskUtils との循環import を避けるためここにも定義
function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
