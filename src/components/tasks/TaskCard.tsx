'use client'

import { useState } from 'react'
import {
  Check,
  Archive,
  Package,
  Plus,
  Trash2,
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

  // Handle action button click - marks complete/uncomplete
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)

    if (isCompleted && onUncomplete) {
      onUncomplete(task.id)
    } else if (!isCompleted && onComplete) {
      onComplete(task.id)
    }
  }

  // Handle archive/delete click
  const handleSecondaryActionClick = (e: React.MouseEvent) => {
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
        'transition-all duration-500 ease-out',
        'cursor-pointer',
        isHighlighted && 'ring-2 ring-[#3E000C]'
      )}
      style={{
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        height: '340px',
      }}
    >
      {/* Background image/gradient */}
      <div
        className={cn(
          'absolute inset-0',
          !task.image_url && !task.category?.image_url && getGradientClass()
        )}
      >
        {task.image_url ? (
          <img
            src={task.image_url}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        ) : task.category?.image_url ? (
          <img
            src={task.category.image_url}
            alt={task.category.name}
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

      {/* Overlay gradient with smooth animation */}
      <div 
        className={cn(
          'absolute inset-0 transition-all duration-700 ease-out',
          isCompleted && 'animate-pulse-once'
        )}
        style={{
          background: isCompleted
            ? 'linear-gradient(to top, rgba(62, 0, 12, 0.95) 0%, rgba(62, 0, 12, 0.75) 40%, rgba(62, 0, 12, 0.4) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
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

          {/* Secondary action button */}
          <button
            onClick={handleSecondaryActionClick}
            className={cn(
              'w-9 h-9 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'bg-white/20 backdrop-blur-sm'
            )}
          >
            {isCompleted ? (
              <Archive className="w-4 h-4 text-white" />
            ) : (
              <Trash2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Bottom content - aligned to bottom */}
        <div className="space-y-3 mt-auto">
          {/* Title */}
          <h3 className={cn(
            'text-2xl font-bold text-white drop-shadow-md transition-all duration-500',
            isCompleted && 'opacity-90'
          )}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className={cn(
              'text-sm text-white/80 line-clamp-2 transition-all duration-500',
              isCompleted && 'text-white/70'
            )}>
              {task.description}
            </p>
          )}

          {/* Meta row - quantity */}
          {getQuantityDisplay() && (
            <p className={cn(
              'text-sm text-white/90 font-medium transition-all duration-500',
              isCompleted && 'text-white/80'
            )}>
              {getQuantityDisplay()}
            </p>
          )}

          {/* Action button - same size for both states */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleActionClick}
              disabled={isAnimating}
              className={cn(
                'flex items-center justify-center gap-2',
                'w-[140px] h-11 rounded-full',
                'text-sm font-semibold transition-all duration-300',
                'active:scale-95',
                isAnimating && 'scale-105',
                isCompleted
                  ? 'bg-[#f5fffa] text-[#3E000C]'
                  : 'bg-[#3E000C] text-[#f5fffa] hover:bg-[#5C0013]'
              )}
            >
              {isCompleted ? (
                <>
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                  <span>Добавлено</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
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
