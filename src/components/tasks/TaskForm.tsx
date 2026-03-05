'use client'

import { useState } from 'react'
import { Camera, X, ChevronRight, ChevronLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { TaskCategory, User } from '@/lib/supabase/database.types'
import * as LucideIcons from 'lucide-react'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormData) => void
  categories: TaskCategory[]
  familyMembers?: User[]
  isLoading?: boolean
}

export interface TaskFormData {
  title: string
  description?: string
  type: 'shopping' | 'home' | 'other'
  category_id: string
  quantity?: number
  unit?: string
  image_url?: string
}

const units = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'м']

const taskTypes = [
  { 
    value: 'shopping' as const, 
    label: 'Покупки', 
    description: 'Продукты, вещи, товары',
  },
  { 
    value: 'home' as const, 
    label: 'Дом', 
    description: 'Уборка, ремонт, сад',
  },
  { 
    value: 'other' as const, 
    label: 'Другое', 
    description: 'Всё остальное',
  },
]

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name]
  return Icon ? <Icon className={className} /> : <Package className={className} />
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  isLoading,
}: TaskFormProps) {
  const [step, setStep] = useState(1)
  const [taskType, setTaskType] = useState<'shopping' | 'home' | 'other' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'шт',
  })

  // Filter categories by type
  const filteredCategories = taskType ? categories.filter((c) => c.type === taskType) : []

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleTypeSelect = (type: 'shopping' | 'home' | 'other') => {
    setTaskType(type)
    setSelectedCategory('')
    setStep(2)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleSubmit = () => {
    if (!formData.title || !selectedCategory || !taskType) return

    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      type: taskType,
      category_id: selectedCategory,
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      unit: taskType === 'shopping' ? formData.unit : undefined,
      image_url: imageUrl || undefined,
    })

    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setStep(1)
    setTaskType(null)
    setSelectedCategory('')
    setImageUrl('')
    setFormData({
      title: '',
      description: '',
      quantity: '',
      unit: 'шт',
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#F0E8E8]">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#1C1C1E]" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                s === step ? 'w-6 bg-burgundy' : 'w-1 bg-[#E5E0E0]'
              )}
            />
          ))}
        </div>

        <button
          onClick={handleClose}
          className="p-2 -mr-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
        >
          <X className="w-6 h-6 text-[#1C1C1E]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Task Type */}
        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1C1C1E]">Что добавляем?</h2>
              <p className="text-sm text-[#8E8E93] mt-1">Выберите тип задачи</p>
            </div>

            <div className="space-y-2">
              {taskTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-2xl',
                    'border transition-all duration-200',
                    'hover:border-[#D4C4C4] active:scale-[0.98]',
                    'border-[#F0E8E8]'
                  )}
                >
                  <div className="text-left">
                    <p className="font-medium text-[#1C1C1E]">{type.label}</p>
                    <p className="text-sm text-[#8E8E93]">{type.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1C1C1E]">Категория</h2>
              <p className="text-sm text-[#8E8E93] mt-1">Уточните, что именно</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-2xl',
                      'border transition-all duration-200',
                      'hover:border-[#D4C4C4] active:scale-[0.98]',
                      isSelected
                        ? 'border-burgundy bg-burgundy/5'
                        : 'border-[#F0E8E8]'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      isSelected ? 'bg-burgundy/10' : 'bg-[#F8F5F5]'
                    )}>
                      <DynamicIcon
                        name={category.icon || 'Package'}
                        className={cn('w-6 h-6', isSelected ? 'text-burgundy' : 'text-[#8E8E93]')}
                      />
                    </div>
                    <span className={cn(
                      'text-xs font-medium text-center',
                      isSelected ? 'text-burgundy' : 'text-[#1C1C1E]'
                    )}>
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedCategory && (
              <Button
                onClick={handleNext}
                className="w-full bg-burgundy hover:bg-burgundy-light text-white"
              >
                Далее
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1C1C1E]">Детали</h2>
              <p className="text-sm text-[#8E8E93] mt-1">
                {selectedCategoryData?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1C1C1E]">
                  {taskType === 'shopping' ? 'Что купить?' : 'Название'}
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    taskType === 'shopping'
                      ? 'Например: Молоко, Хлеб...'
                      : 'Название задачи'
                  }
                  className="text-base border-[#F0E8E8] focus:border-burgundy"
                />
              </div>

              {/* Quantity - only for shopping */}
              {taskType === 'shopping' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1C1E]">Количество</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                      className="flex-1 border-[#F0E8E8] focus:border-burgundy"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {units.slice(0, 4).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormData({ ...formData, unit: u })}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm transition-all border',
                            formData.unit === u
                              ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                              : 'bg-white text-[#1C1C1E] border-[#F0E8E8] hover:border-[#D4C4C4]'
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1C1C1E]">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={2}
                  className="border-[#F0E8E8] focus:border-burgundy resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!formData.title.trim()}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white"
            >
              Далее
            </Button>
          </div>
        )}

        {/* Step 4: Photo */}
        {step === 4 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1C1C1E]">Фото</h2>
              <p className="text-sm text-[#8E8E93] mt-1">
                {taskType === 'other' ? 'Добавьте изображение' : 'Опционально'}
              </p>
            </div>

            {/* Image upload */}
            <div className="space-y-3">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Task"
                    className="w-full h-64 rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed border-[#E5E0E0] cursor-pointer hover:border-[#D4C4C4] transition-colors bg-[#FAFAFA]">
                  <Camera className="w-10 h-10 text-[#8E8E93] mb-2" />
                  <span className="text-sm text-[#8E8E93]">Нажмите для загрузки</span>
                  <span className="text-xs text-[#8E8E93] mt-1">или пропустите</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSubmit}
                className="flex-1 border-[#F0E8E8]"
              >
                Пропустить
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-burgundy hover:bg-burgundy-light text-white"
              >
                {isLoading ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
