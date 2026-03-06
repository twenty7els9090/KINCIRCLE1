'use client'

import { useState } from 'react'
import {
  Check,
  Trash2,
  Archive,
  Package,
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
  const [isExiting, setIsExiting] = useState(false)

  const isCompleted = task.status === 'completed'

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
    setIsExiting(true)
    
    setTimeout(() => {
      if (isCompleted && onArchive) {
        onArchive(task.id)
      } else if (!isCompleted && onDelete) {
        onDelete(task.id)
      }
      setIsExiting(false)
    }, 200)
  }

  return (
    <div
      onClick={() => onClick?.(task.id)}
      className={cn(
        'relative rounded-3xl overflow-hidden',
        'transition-all duration-300 ease-out',
        'cursor-pointer',
        isHighlighted && 'ring-2 ring-[#6C5CE7]',
        isExiting && 'animate-card-exit',
        'animate-card-enter'
      )}
      style={{
        background: 'rgba(26, 31, 53, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.4)',
        marginBottom: '12px',
      }}
    >
      <div className="p-4">
        {/* Top row - Category image + Action button */}
        <div className="flex items-start justify-between mb-3">
          {/* Category image with gradient */}
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #6C5CE7, #5F5FEF)',
              boxShadow: '0 8px 20px rgba(108, 92, 231, 0.3)',
            }}
          >
            {task.image_url ? (
              <img
                src={task.image_url}
                alt={task.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <DynamicIcon
                name={task.category?.icon || 'Package'}
                className="w-10 h-10 text-white/80"
              />
            )}
          </div>

          {/* Delete/Archive button */}
          <button
            onClick={handleDeleteOrArchive}
            className={cn(
              'w-9 h-9 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'bg-white/10 backdrop-blur-sm',
              'hover:bg-white/15'
            )}
          >
            {isCompleted ? (
              <Archive className="w-4 h-4 text-white/70" />
            ) : (
              <Trash2 className="w-4 h-4 text-white/70" />
            )}
          </button>
        </div>

        {/* Category label */}
        {task.category && (
          <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
            {task.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white mt-1">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-white/50 mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Quantity */}
        {getQuantityDisplay() && (
          <span className="text-base font-semibold text-[#6C5CE7] mt-2 block">
            {getQuantityDisplay()}
          </span>
        )}

        {/* Action button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleActionClick}
            disabled={isAnimating}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-full',
              'text-sm font-medium transition-all duration-200',
              'active:scale-[0.97]',
              isAnimating && 'scale-105'
            )}
            style={{
              background: isCompleted
                ? 'linear-gradient(145deg, #6C5CE7, #5F5FEF)'
                : 'rgba(108, 92, 231, 0.2)',
              border: isCompleted
                ? 'none'
                : '1px solid #6C5CE7',
              color: '#FFFFFF',
              boxShadow: isCompleted
                ? '0 8px 20px rgba(108, 92, 231, 0.4)'
                : 'none',
            }}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                <span>Добавлено</span>
              </>
            ) : (
              <span>Добавить</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
