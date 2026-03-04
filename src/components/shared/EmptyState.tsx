'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#F8F5F5] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-burgundy/50" />
      </div>
      <h3 className="text-lg font-medium text-[#1C1C1E] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#8E8E93] text-center max-w-[250px] mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
