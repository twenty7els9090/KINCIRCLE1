'use client'

import { useState } from 'react'
import {
  Check,
  Trash2,
  Package,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskCategory, User as UserType } from '@/lib/supabase/database.types'
import * as LucideIcons from 'lucide-react'

interface TaskCardProps {
  task: Task & {
    category?: TaskCategory | null
    creator?: UserType | null
  }
  onComplete?: (taskId: string) => void
  onUncomplete?: (taskId: string) => void
  onArchive?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onClick?: (taskId: string) => void
  isHighlighted?: boolean
}

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name]
  return Icon ? <Icon className={className} /> : <Package className={className} />
}

export function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onArchive,
  onDelete,
  onClick,
  isHighlighted,
}: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const isCompleted = task.status === 'completed'

  // Get gradient class based on category type
  const getGradientClass = () => {
    switch (task.type) {
      case 'shopping':
        return 'gradient-shopping'
      case 'home':
        return 'gradient-home'
      default:
        return 'gradient-other'
    }
  }

  // Format quantity display
  const getQuantityDisplay = () => {
    if (!task.quantity) return null
    const unit = task.unit || 'шт'
    return `${task.quantity} ${unit}`
  }

  // Handle action button click
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)

    if (isCompleted && onUncomplete) {
      onUncomplete(task.id)
    } else if (!isCompleted && onComplete) {
      onComplete(task.id)
    }
  }

  // Handle delete/archive click
  const handleDeleteOrArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCompleted && onArchive) {
      onArchive(task.id)
    } else if (!isCompleted && onDelete) {
      onDelete(task.id)
    }
  }

  return (
    <div
      onClick={() => onClick?.(task.id)}
      className={cn(
        'relative rounded-[20px] overflow-hidden',
        'transition-all duration-300 ease-out',
        'cursor-pointer',
        isHighlighted && 'ring-2 ring-burgundy',
        isCompleted && 'opacity-85'
      )}
      style={{
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        height: '220px',
      }}
    >
      {/* Background image/gradient */}
      <div
        className={cn(
          'absolute inset-0',
          !task.image_url && getGradientClass()
        )}
      >
        {task.image_url ? (
          <img
            src={task.image_url}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DynamicIcon
              name={task.category?.icon || 'Package'}
              className="w-20 h-20 text-white/30"
            />
          </div>
        )}
      </div>

      {/* Overlay gradient for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
        }}
      />

      {/* Content on top of image */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Top row - badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Category badge */}
          {task.category && (
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              'bg-white/20 backdrop-blur-sm text-white'
            )}>
              {task.category.name}
            </span>
          )}

          {/* Delete/Archive button */}
          <button
            onClick={handleDeleteOrArchive}
            className={cn(
              'w-9 h-9 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'bg-white/20 backdrop-blur-sm'
            )}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            {task.title}
          </h3>

          {/* Meta row - only quantity */}
          {getQuantityDisplay() && (
            <span className="text-sm text-white/80">
              {getQuantityDisplay()}
            </span>
          )}

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleActionClick}
              disabled={isAnimating}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full',
                'text-sm font-medium transition-all duration-300',
                'active:scale-95',
                isAnimating && 'scale-110',
                isCompleted
                  ? 'bg-white text-burgundy'
                  : 'bg-burgundy text-white hover:bg-burgundy-light'
              )}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>Добавлено</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>Добавить</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
