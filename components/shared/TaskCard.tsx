'use client';

/**
 * TaskCard Component
 * Card for displaying task items
 */
import { Check, Clock, User, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Task, TaskCategory, User as UserType } from '@/lib/supabase/types';

interface TaskCardProps {
  task: Task & {
    category?: TaskCategory | null;
    creator?: Pick<UserType, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
    assignees?: Pick<UserType, 'id' | 'first_name' | 'last_name' | 'avatar_url'>[];
    completer?: Pick<UserType, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  };
  onToggleComplete?: (taskId: string, isCompleted: boolean) => void;
  onClick?: (taskId: string) => void;
  className?: string;
}

export function TaskCard({
  task,
  onToggleComplete,
  onClick,
  className,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(task.id, isCompleted);
  };

  return (
    <div
      onClick={() => onClick?.(task.id)}
      className={cn(
        'kincircle-card cursor-pointer transition-all duration-200',
        'hover:shadow-card-hover',
        isCompleted && 'opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            isCompleted
              ? 'bg-burgundy border-burgundy'
              : 'border-burgundy/30 hover:border-burgundy'
          )}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={cn(
            'font-medium text-text-primary',
            isCompleted && 'line-through'
          )}>
            {task.title}
          </p>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Quantity */}
            {task.quantity && (
              <span className="text-xs text-text-secondary">
                {task.quantity} {task.unit || 'pcs'}
              </span>
            )}

            {/* Price */}
            {task.price && (
              <span className="text-xs font-medium text-burgundy">
                ${task.price.toFixed(2)}
              </span>
            )}

            {/* Category */}
            {task.category && (
              <span className="text-xs bg-burgundy/10 text-burgundy px-2 py-0.5 rounded-full">
                {task.category.name}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            {/* Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <Avatar key={assignee.id} className="w-6 h-6 border border-white">
                    <AvatarImage src={assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-burgundy/10 text-burgundy">
                      {assignee.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 3 && (
                  <span className="text-xs text-text-secondary ml-1">
                    +{task.assignees.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Has image */}
            {task.image_url && (
              <ImageIcon className="w-4 h-4 text-text-secondary" />
            )}

            {/* Completed info */}
            {isCompleted && task.completer && (
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Check className="w-3 h-3" />
                <span>{task.completer.first_name}</span>
              </div>
            )}

            {/* Due date */}
            {!isCompleted && (
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock className="w-3 h-3" />
                <span>Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
