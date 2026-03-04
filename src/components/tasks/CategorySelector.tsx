'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskCategory } from '@/lib/supabase/database.types'

interface CategorySelectorProps {
  categories: TaskCategory[]
  selectedId: string | null
  onSelect: (categoryId: string | null) => void
  type: 'shopping' | 'home' | 'other'
}

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name]
  return Icon ? <Icon className={className} /> : <LucideIcons.Package className={className} />
}

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  type,
}: CategorySelectorProps) {
  const filteredCategories = categories.filter((c) => c.type === type)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1C1C1E]">Категория</label>
      <div className="grid grid-cols-4 gap-2">
        {filteredCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id === selectedId ? null : category.id)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
              'border-2',
              selectedId === category.id
                ? 'border-burgundy bg-burgundy/5'
                : 'border-transparent bg-[#F8F5F5] hover:bg-[#F0E8E8]'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                selectedId === category.id
                  ? 'bg-burgundy text-white'
                  : 'bg-white text-burgundy'
              )}
            >
              <DynamicIcon name={category.icon} className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-[10px] text-center line-clamp-2',
                selectedId === category.id ? 'text-burgundy font-medium' : 'text-[#8E8E93]'
              )}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Compact version for quick task creation
interface QuickCategorySelectorProps {
  categories: TaskCategory[]
  selectedId: string | null
  onSelect: (categoryId: string) => void
}

export function QuickCategorySelector({
  categories,
  selectedId,
  onSelect,
}: QuickCategorySelectorProps) {
  const shoppingCategories = categories.filter((c) => c.type === 'shopping')

  return (
    <div className="overflow-x-auto horizontal-scroll -mx-4 px-4">
      <div className="flex gap-2 pb-2">
        {shoppingCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0',
              'transition-all duration-200 border-2',
              selectedId === category.id
                ? 'border-burgundy bg-burgundy/5'
                : 'border-transparent bg-[#F8F5F5] hover:bg-[#F0E8E8]'
            )}
          >
            <DynamicIcon
              name={category.icon}
              className={cn(
                'w-4 h-4',
                selectedId === category.id ? 'text-burgundy' : 'text-[#8E8E93]'
              )}
            />
            <span
              className={cn(
                'text-sm whitespace-nowrap',
                selectedId === category.id ? 'text-burgundy font-medium' : 'text-[#8E8E93]'
              )}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
