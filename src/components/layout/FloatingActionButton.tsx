'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick?: () => void
  disabled?: boolean
}

export function FloatingActionButton({ onClick, disabled }: FloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'fixed bottom-24 right-4 z-40',
        'w-14 h-14 rounded-2xl',
        'flex items-center justify-center',
        'transition-all duration-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{
        background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
        boxShadow: isPressed
          ? '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 6px 24px rgba(62, 0, 12, 0.35), 0 2px 8px rgba(62, 0, 12, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      <Plus
        className="w-6 h-6 text-white"
        strokeWidth={2.5}
      />
    </button>
  )
}

// Extended FAB with menu options
interface FABOption {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

interface ExtendedFloatingActionButtonProps {
  options: FABOption[]
  disabled?: boolean
}

export function ExtendedFloatingActionButton({
  options,
  disabled,
}: ExtendedFloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-3">
      {/* Options */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick()
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'transition-all duration-200',
                'animate-in slide-in-from-right-2 duration-200'
              )}
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(62, 0, 12, 0.08)',
                boxShadow: '0 4px 24px rgba(62, 0, 12, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                animationDelay: `${index * 50}ms`,
              }}
            >
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {option.label}
              </span>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                }}
              >
                {option.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-14 h-14 rounded-2xl',
          'flex items-center justify-center',
          'transition-all duration-300',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'rotate-45'
        )}
        style={{
          background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
          boxShadow: isOpen
            ? '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 6px 24px rgba(62, 0, 12, 0.35), 0 2px 8px rgba(62, 0, 12, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        <Plus
          className="w-6 h-6 text-white transition-transform duration-300"
          strokeWidth={2.5}
        />
      </button>
    </div>
  )
}
