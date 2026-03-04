'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completed: number
  total: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  completed,
  total,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  if (total === 0) return null

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#8E8E93]">
            Выполнено сегодня
          </span>
          <span className="text-sm font-medium text-burgundy">
            {completed} из {total}
          </span>
        </div>
      )}
      
      <div className="relative w-full h-2 bg-[#F0E8E8] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-burgundy to-burgundy-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabel && percentage > 0 && (
        <div className="mt-1 text-right">
          <span className="text-xs text-[#8E8E93]">{percentage}%</span>
        </div>
      )}
    </div>
  )
}

// Compact version for headers
export function CompactProgressBar({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  if (total === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-24 h-1.5 bg-[#F0E8E8] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-burgundy rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-[#8E8E93]">
        {completed}/{total}
      </span>
    </div>
  )
}

// Circular progress for dashboard
interface CircularProgressProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function CircularProgress({
  completed,
  total,
  size = 60,
  strokeWidth = 4,
}: CircularProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F0E8E8"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#8B1E3F"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-burgundy">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
