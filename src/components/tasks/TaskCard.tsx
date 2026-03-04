'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Archive,
  Trash2,
  MoreVertical,
  Package,
  Sparkles,
  Clock,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Task, TaskCategory, User as UserType } from '@/lib/supabase/database.types'
import * as LucideIcons from 'lucide-react'

interface TaskCardProps {
  task: Task & {
    category?: TaskCategory | null
    creator?: UserType | null
  }
  onComplete?: (taskId: string) => void
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
  onArchive,
  onDelete,
  onClick,
  isHighlighted,
}: TaskCardProps) {
  const [isPressed, setIsPressed] = useState(false)

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

  return (
    <div
      onClick={() => onClick?.(task.id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'relative bg-[#F8F5F5] rounded-2xl p-4 transition-all duration-200',
        'hover:shadow-card cursor-pointer',
        isPressed && 'scale-[0.98]',
        isHighlighted && 'card-highlight',
        isCompleted && 'opacity-75'
      )}
    >
      <div className="flex gap-3">
        {/* Image/Icon section */}
        <div
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden',
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
            <DynamicIcon
              name={task.category?.icon || 'Package'}
              className="w-7 h-7 text-white"
            />
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-medium text-[#1C1C1E] truncate',
                  isCompleted && 'line-through text-[#8E8E93]'
                )}
              >
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-[#8E8E93] truncate mt-0.5">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isCompleted && !isArchived && onArchive && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8E8E93] hover:text-burgundy"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(task.id)
                  }}
                >
                  <Archive className="w-4 h-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#8E8E93]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isCompleted && onComplete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onComplete(task.id)
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Выполнено
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(task.id)
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Category badge */}
            {task.category && (
              <Badge
                variant="secondary"
                className="bg-white text-[#8E8E93] text-xs"
              >
                {task.category.name}
              </Badge>
            )}

            {/* Quantity */}
            {getQuantityDisplay() && (
              <Badge
                variant="secondary"
                className="bg-white text-[#8E8E93] text-xs"
              >
                {getQuantityDisplay()}
              </Badge>
            )}

            {/* Price */}
            {task.price && (
              <Badge
                variant="secondary"
                className="bg-burgundy/10 text-burgundy text-xs"
              >
                {task.price.toLocaleString('ru-RU')} ₽
              </Badge>
            )}
          </div>

          {/* Completed info */}
          {isCompleted && task.completed_at && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#8E8E93]">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>
                Выполнено {new Date(task.completed_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
