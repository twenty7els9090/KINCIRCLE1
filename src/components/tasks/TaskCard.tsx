'use client'

import { useState } from 'react'
import {
  Check,
  Trash2,
  Archive,
  Package,
  ChevronRight,
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
        'relative overflow-hidden',
        'transition-all duration-300 ease-out cursor-pointer',
        isHighlighted && 'glow-accent',
        isExiting && 'card-exit',
        'card-enter'
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(62, 0, 12, 0.08)',
        borderRadius: '20px',
        boxShadow: isHighlighted
          ? '0 8px 32px rgba(62, 0, 12, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          : '0 4px 24px rgba(62, 0, 12, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        marginBottom: '12px',
      }}
    >
      {/* Inner content container */}
      <div className="p-4">
        {/* Top row - Category image + Content + Action */}
        <div className="flex items-center gap-4">
          {/* Category image with gradient */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
              boxShadow: '0 4px 16px rgba(62, 0, 12, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
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
                className="w-8 h-8 text-white/90"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category label */}
            {task.category && (
              <span className="text-[10px] text-[#3E000C]/50 font-semibold uppercase tracking-wider">
                {task.category.name}
              </span>
            )}

            {/* Title */}
            <h3 className="text-base font-semibold text-[#1a1a1a] truncate mt-0.5">
              {task.title}
            </h3>

            {/* Description or quantity */}
            {task.description ? (
              <p className="text-sm text-[#1a1a1a]/50 truncate mt-0.5">
                {task.description}
              </p>
            ) : getQuantityDisplay() ? (
              <span className="text-sm font-semibold text-[#3E000C] mt-0.5 block">
                {getQuantityDisplay()}
              </span>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Delete/Archive button */}
            <button
              onClick={handleDeleteOrArchive}
              className={cn(
                'w-9 h-9 rounded-xl',
                'flex items-center justify-center',
                'transition-all duration-200',
              )}
              style={{
                background: 'rgba(62, 0, 12, 0.04)',
                border: '1px solid rgba(62, 0, 12, 0.06)',
              }}
            >
              {isCompleted ? (
                <Archive className="w-4 h-4 text-[#1a1a1a]/40" />
              ) : (
                <Trash2 className="w-4 h-4 text-[#1a1a1a]/40" />
              )}
            </button>

            {/* Complete/Uncomplete button */}
            <button
              onClick={handleActionClick}
              disabled={isAnimating}
              className={cn(
                'w-11 h-11 rounded-xl',
                'flex items-center justify-center',
                'transition-all duration-200',
                isAnimating && 'scale-105'
              )}
              style={{
                background: isCompleted
                  ? 'rgba(62, 0, 12, 0.08)'
                  : 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                border: isCompleted
                  ? '1px solid rgba(62, 0, 12, 0.12)'
                  : 'none',
                boxShadow: isCompleted
                  ? 'none'
                  : '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 text-[#3E000C]" strokeWidth={2.5} />
              ) : (
                <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Completed indicator line */}
      {isCompleted && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #3E000C 0%, #5a1525 100%)',
            opacity: 0.6,
          }}
        />
      )}
    </div>
  )
}
