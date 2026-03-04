'use client'

import { useState } from 'react'
import {
  Check,
  Archive,
  Trash2,
  Package,
  Plus,
  Minus,
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
  const isArchived = task.status === 'archived'

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
        'relative bg-white rounded-[20px] overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg cursor-pointer',
        isHighlighted && 'card-highlight',
        isCompleted && 'opacity-90'
      )}
      style={{
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Image section - top part */}
      <div
        className={cn(
          'relative w-full h-40 rounded-t-[20px] overflow-hidden',
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
              className="w-16 h-16 text-white/80"
            />
          </div>
        )}

        {/* Delete/Archive button - top right */}
        <button
          onClick={handleDeleteOrArchive}
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            isCompleted 
              ? 'bg-white/90 hover:bg-white' 
              : 'bg-white/90 hover:bg-red-50'
          )}
        >
          {isCompleted ? (
            <Archive className="w-5 h-5 text-[#8E8E93] hover:text-burgundy" />
          ) : (
            <Trash2 className="w-5 h-5 text-[#8E8E93] hover:text-red-500" />
          )}
        </button>

        {/* Category badge - top left */}
        {task.category && (
          <div className="absolute top-3 left-3">
            <span className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium',
              'bg-white/90 backdrop-blur-sm text-[#1C1C1E]'
            )}>
              {task.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4">
        {/* Title */}
        <h3
          className={cn(
            'text-xl font-semibold text-[#1C1C1E]',
            isCompleted && 'line-through text-[#8E8E93]'
          )}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-[#8E8E93] mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta info row */}
        <div className="flex items-center gap-3 mt-3">
          {/* Quantity */}
          {getQuantityDisplay() && (
            <span className="text-sm text-[#8E8E93]">
              {getQuantityDisplay()}
            </span>
          )}

          {/* Price */}
          {task.price && (
            <span className="text-sm font-medium text-burgundy">
              {task.price.toLocaleString('ru-RU')} ₽
            </span>
          )}

          {/* Assigned to */}
          {task.assigned_to && task.assigned_to.length > 0 && (
            <span className="text-xs text-[#8E8E93]">
              для {task.assigned_to.length} чел.
            </span>
          )}
        </div>

        {/* Action button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleActionClick}
            disabled={isAnimating}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full',
              'text-sm font-medium transition-all duration-300',
              'active:scale-95',
              isAnimating && 'scale-110',
              isCompleted
                ? 'bg-burgundy text-white'
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

        {/* Completed info */}
        {isCompleted && task.completed_at && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F0E8E8]">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs text-[#8E8E93]">
              Выполнено {new Date(task.completed_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
