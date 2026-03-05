'use client'

import { useState, useEffect } from 'react'
import { Package, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { useTaskStore, useUserStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Task } from '@/lib/supabase/database.types'

export function TasksSection() {
  const { tasks, categories, setTasks, setCategories } = useTaskStore()
  const { currentFamilyId, families, user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)

  const currentFamily = families.find((f) => f.id === currentFamilyId)

  // Fetch tasks and categories
  useEffect(() => {
    if (currentFamilyId) {
      fetchTasks()
      fetchCategories()
    }
  }, [currentFamilyId])

  const fetchTasks = async () => {
    if (!currentFamilyId) return
    setIsLoading(true)
    
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:task_categories(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .eq('family_id', currentFamilyId)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTasks(data as Task[])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('order')

      if (!error && data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    if (!currentFamilyId || !user) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          family_id: currentFamilyId,
          created_by: user.id,
          title: taskData.title,
          description: taskData.description,
          type: taskData.type,
          category_id: taskData.category_id,
          quantity: taskData.quantity,
          unit: taskData.unit,
          image_url: taskData.image_url,
          status: 'active',
        })
        .select(`
          *,
          category:task_categories(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .single()

      if (!error && data) {
        setTasks([data as Task, ...tasks])
        setHighlightedTaskId(data.id)
        setTimeout(() => setHighlightedTaskId(null), 2000)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_by: user?.id,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (!error) {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed', completed_by: user?.id || null, completed_at: new Date().toISOString() }
              : t
          )
        )
      }
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleUncompleteTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'active',
          completed_by: null,
          completed_at: null,
        })
        .eq('id', taskId)

      if (!error) {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'active' as const, completed_by: null, completed_at: null }
              : t
          )
        )
      }
    } catch (error) {
      console.error('Error uncompleting task:', error)
    }
  }

  // Archive task from completed state
  const handleArchiveTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (!error) {
        setTasks(tasks.filter((t) => t.id !== taskId))
      }
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  // Delete task from active state
  const handleDeleteTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', taskId)

      if (!error) {
        setTasks(tasks.filter((t) => t.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // No family selected
  if (!currentFamilyId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={Package}
          title="Нет семьи"
          description="Создайте или присоединитесь к семье, чтобы начать управлять задачами"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4">
        {tasks.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Нет задач"
            description="Нажмите + чтобы добавить задачу"
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onUncomplete={handleUncompleteTask}
              onArchive={handleArchiveTask}
              onDelete={handleDeleteTask}
              isHighlighted={highlightedTaskId === task.id}
            />
          ))
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-burgundy"
        style={{
          boxShadow: '0 4px 20px rgba(139, 30, 63, 0.3)'
        }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Task form modal */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={handleCreateTask}
        categories={categories}
        familyMembers={currentFamily?.members?.map((m: any) => m.user) || []}
        isLoading={isLoading}
      />
    </div>
  )
}
