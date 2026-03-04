import { create } from 'zustand'
import type { Task, TaskCategory, TaskInsert, TaskUpdate } from '@/lib/supabase/database.types'

interface TaskState {
  // Tasks data
  tasks: Task[]
  categories: TaskCategory[]
  isLoading: boolean
  
  // Filter/sort options
  filterStatus: Task['status'] | 'all'
  filterType: Task['type'] | 'all'
  sortBy: 'created_at' | 'title' | 'status'
  
  // Actions
  setTasks: (tasks: Task[]) => void
  setCategories: (categories: TaskCategory[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: TaskUpdate) => void
  removeTask: (taskId: string) => void
  setLoading: (loading: boolean) => void
  
  // Filters
  setFilterStatus: (status: Task['status'] | 'all') => void
  setFilterType: (type: Task['type'] | 'all') => void
  setSortBy: (sortBy: 'created_at' | 'title' | 'status') => void
  
  // Computed helpers
  getActiveTasks: () => Task[]
  getCompletedTasks: () => Task[]
  getArchivedTasks: () => Task[]
  getTasksByCategory: (categoryId: string) => Task[]
  getTodayProgress: () => { completed: number; total: number }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  isLoading: false,
  filterStatus: 'all',
  filterType: 'all',
  sortBy: 'created_at',

  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
    
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),
    
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
    
  setLoading: (loading) => set({ isLoading: loading }),

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterType: (type) => set({ filterType: type }),
  setSortBy: (sortBy) => set({ sortBy }),

  getActiveTasks: () => {
    const { tasks } = get()
    return tasks.filter((t) => t.status === 'active')
  },

  getCompletedTasks: () => {
    const { tasks } = get()
    return tasks.filter((t) => t.status === 'completed')
  },

  getArchivedTasks: () => {
    const { tasks } = get()
    return tasks.filter((t) => t.status === 'archived')
  },

  getTasksByCategory: (categoryId) => {
    const { tasks } = get()
    return tasks.filter((t) => t.category_id === categoryId)
  },

  getTodayProgress: () => {
    const { tasks } = get()
    const activeTasks = tasks.filter((t) => t.status === 'active')
    const completedToday = tasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completed_at &&
        new Date(t.completed_at).toDateString() === new Date().toDateString()
    )
    return {
      completed: completedToday.length,
      total: activeTasks.length + completedToday.length,
    }
  },
}))
