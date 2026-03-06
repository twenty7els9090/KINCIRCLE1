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
        'w-14 h-14 rounded-full',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:scale-105',
        'active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{
        background: 'linear-gradient(145deg, #6C5CE7, #5F5FEF)',
        boxShadow: isPressed
          ? '0 8px 20px rgba(108, 92, 231, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 12px 30px rgba(108, 92, 231, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
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
                background: 'rgba(26, 31, 53, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                animationDelay: `${index * 50}ms`,
              }}
            >
              <span className="text-sm font-medium text-white">
                {option.label}
              </span>
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(108, 92, 231, 0.2)',
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
          'w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'transition-all duration-200',
          'hover:scale-105',
          'active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'rotate-45'
        )}
        style={{
          background: 'linear-gradient(145deg, #6C5CE7, #5F5FEF)',
          boxShadow: isOpen
            ? '0 8px 20px rgba(108, 92, 231, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 12px 30px rgba(108, 92, 231, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Plus 
          className="w-6 h-6 text-white transition-transform duration-200" 
          strokeWidth={2.5}
        />
      </button>
    </div>
  )
}
