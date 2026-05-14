export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom'
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  parent_id: string | null
  title: string
  icon: string
  priority: Priority
  frequency: FrequencyType
  days_of_week: number[]
  interval_weeks: number
  start_date: string
  color: string
  created_at: string
  is_active: boolean
}

export interface ColorOption {
  id: string
  hex: string
  label: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  completed_date: string
}
