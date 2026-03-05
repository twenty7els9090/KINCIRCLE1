'use client'

import { useState, useEffect, useRef } from 'react'
import { Package, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { useTaskStore, useUserStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Task } from '@/lib/supabase/database.types'

export function TasksSection() {
  const { tasks, categories, setTasks, setCategories, addTask, updateTask, removeTask } = useTaskStore()
  const { currentFamilyId, families, user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)
  
  const realtimeRef = useRef(false)

  const currentFamily = families.find((f) => f.id === currentFamilyId)

  useEffect(() => {
    if (currentFamilyId) {
      fetchTasks()
      fetchCategories()
    }
  }, [currentFamilyId])

  useEffect(() => {
    if (!currentFamilyId || realtimeRef.current) return

    const supabase = getSupabaseClient()
    realtimeRef.current = true
    
    const channel = supabase
      .channel(`tasks-${currentFamilyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${currentFamilyId}`,
        },
        async (payload) => {
          const eventType = payload.eventType
          const newData = payload.new as any
          const oldData = payload.old as any

          if (eventType === 'INSERT') {
            const exists = useTaskStore.getState().tasks.some(t => t.id === newData.id)
            if (!exists) {
              const { data } = await supabase
                .from('tasks')
                .select(`
                  *,
                  category:task_categories(*),
                  creator:users!tasks_created_by_fkey(*)
                `)
                .eq('id', newData.id)
                .single()
              
              if (data) {
                addTask(data as Task)
                setHighlightedTaskId(data.id)
                setTimeout(() => setHighlightedTaskId(null), 2000)
              }
            }
          } else if (eventType === 'UPDATE') {
            const newStatus = newData.status
            
            if (newStatus === 'archived' || newStatus === 'deleted') {
              removeTask(newData.id)
            } else {
              const currentTask = useTaskStore.getState().tasks.find(t => t.id === newData.id)
              if (currentTask?.status !== newStatus || currentTask?.updated_at !== newData.updated_at) {
                const { data } = await supabase
                  .from('tasks')
                  .select(`
                    *,
                    category:task_categories(*),
                    creator:users!tasks_created_by_fkey(*)
                  `)
                  .eq('id', newData.id)
                  .single()
                
                if (data) {
                  updateTask(newData.id, data as Task)
                }
              }
            }
          } else if (eventType === 'DELETE') {
            removeTask(oldData.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      realtimeRef.current = false
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
          description: taskData.description || null,
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
        if (!tasks.some(t => t.id === data.id)) {
          addTask(data as Task)
          setHighlightedTaskId(data.id)
          setTimeout(() => setHighlightedTaskId(null), 2000)
        }
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    updateTask(taskId, {
      status: 'completed',
      completed_by: user?.id || null,
      completed_at: new Date().toISOString(),
    } as any)

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_by: user?.id,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
    } catch (error) {
      console.error('Error completing task:', error)
      updateTask(taskId, {
        status: 'active',
        completed_by: null,
        completed_at: null,
      } as any)
    }
  }

  const handleUncompleteTask = async (taskId: string) => {
    updateTask(taskId, {
      status: 'active',
      completed_by: null,
      completed_at: null,
    } as any)

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({
          status: 'active',
          completed_by: null,
          completed_at: null,
        })
        .eq('id', taskId)
    } catch (error) {
      console.error('Error uncompleting task:', error)
      updateTask(taskId, {
        status: 'completed',
        completed_by: user?.id || null,
        completed_at: new Date().toISOString(),
      } as any)
    }
  }

  const handleArchiveTask = async (taskId: string) => {
    removeTask(taskId)

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
        })
        .eq('id', taskId)
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    removeTask(taskId)

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  if (!currentFamilyId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[#f5fffa]">
        <EmptyState
          icon={Package}
          title="Нет семьи"
          description="Создайте или присоединитесь к семье, чтобы начать управлять задачами"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f5fffa]">
      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div 
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '2px solid #3E000C20', borderTopColor: '#3E000C' }}
            />
          </div>
        ) : tasks.length === 0 ? (
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
        className="fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-xl glass-fab"
        style={{
          backgroundColor: 'rgba(62, 0, 12, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <Plus className="w-6 h-6 text-[#3E000C]" strokeWidth={2.5} />
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
