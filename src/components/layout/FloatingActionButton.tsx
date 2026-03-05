'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'

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
        'fixed bottom-20 right-4 z-40',
        'w-14 h-14 rounded-full',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:scale-105',
        'active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{
        backgroundColor: 'rgba(62, 0, 12, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: isPressed
          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Plus 
        className="w-6 h-6" 
        fill="#FFFFFF" 
        stroke="#3E000C" 
        strokeWidth={1.5}
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
    <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-3">
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
                'bg-white shadow-card border border-[#F0E8E8]',
                'hover:bg-[#F8F5F5] transition-all duration-200',
                'animate-in slide-in-from-right-2 duration-200'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-[#1C1C1E]">
                {option.label}
              </span>
              <span className="w-8 h-8 rounded-full bg-[#3E000C]/10 flex items-center justify-center">
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
          backgroundColor: isOpen ? 'rgba(62, 0, 12, 0.25)' : 'rgba(62, 0, 12, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: isOpen
            ? '0 2px 8px rgba(0, 0, 0, 0.12)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Plus 
          className="w-6 h-6 transition-transform duration-200" 
          fill="#FFFFFF" 
          stroke="#3E000C" 
          strokeWidth={1.5}
        />
      </button>
    </div>
  )
}
