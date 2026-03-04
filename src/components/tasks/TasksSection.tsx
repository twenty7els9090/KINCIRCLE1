'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Archive, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { useTaskStore, useUserStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Task } from '@/lib/supabase/database.types'

export function TasksSection() {
  const { tasks, categories, setTasks, setCategories, getTodayProgress } = useTaskStore()
  const { currentFamilyId, families, user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'archived'>('active')
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)

  const currentFamily = families.find((f) => f.id === currentFamilyId)
  const progress = getTodayProgress()

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
        .neq('status', 'deleted')
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
          price: taskData.price,
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

  // Filter tasks by status
  const activeTasks = tasks.filter((t) => t.status === 'active')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const archivedTasks = tasks.filter((t) => t.status === 'archived')

  // No family selected
  if (!currentFamilyId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={Package}
          title="Нет семьи"
          description="Создайте или присоединитесь к семье, чтобы начать управлять задачами"
          action={
            <Button className="bg-burgundy hover:bg-burgundy-light">
              Создать семью
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      {progress.total > 0 && (
        <div className="px-4 py-3 bg-white border-b border-[#F0E8E8]">
          <ProgressBar completed={progress.completed} total={progress.total} />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
        <div className="px-4 pt-4 pb-2 border-b border-[#F0E8E8]">
          <TabsList className="bg-[#F8F5F5]">
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              Активные
              {activeTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-burgundy/10">
                  {activeTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              Выполнено
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              <Archive className="w-4 h-4 mr-1" />
              Архив
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Task lists */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="active" className="p-4 space-y-3 m-0">
            {activeTasks.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Нет активных задач"
                description="Добавьте первую задачу в список"
              />
            ) : (
              activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  isHighlighted={highlightedTaskId === task.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="p-4 space-y-3 m-0">
            {completedTasks.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Нет выполненных задач"
                description="Отмеченные как выполненные задачи появятся здесь"
              />
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onArchive={handleArchiveTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="archived" className="p-4 space-y-3 m-0">
            {archivedTasks.length === 0 ? (
              <EmptyState
                icon={Archive}
                title="Архив пуст"
                description="Архивированные задачи появятся здесь"
              />
            ) : (
              archivedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating action button */}
      <button
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-burgundy text-white flex items-center justify-center shadow-float hover:bg-burgundy-light transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 4px 20px rgba(139, 30, 63, 0.3)' }}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
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
