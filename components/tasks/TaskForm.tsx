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
    <div className="fixed inset-0 z-[60] bg-[#f5fffa] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3E000C]/10" style={{ paddingTop: '57px' }}>
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#3E000C]/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#3E000C]" />
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
              )}
              style={{
                width: s === step ? 24 : 8,
                backgroundColor: s === step ? '#3E000C' : '#3E000C20',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleClose}
          className="p-2 -mr-2 rounded-full hover:bg-[#3E000C]/5 transition-colors"
        >
          <X className="w-6 h-6 text-[#3E000C]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Task Type */}
        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Что добавляем?</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">Выберите тип задачи</p>
            </div>

            <div className="space-y-3">
              {taskTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-2xl',
                    'border-2 transition-all duration-200',
                    'hover:border-[#3E000C]/30 active:scale-[0.98]',
                    'border-[#3E000C]/10 bg-white'
                  )}
                >
                  <div className="text-left">
                    <p className="font-semibold text-[#3E000C] text-lg">{type.label}</p>
                    <p className="text-sm text-[#3E000C]/50">{type.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#3E000C]/40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Категория</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">Уточните, что именно</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full',
                      'transition-all duration-200',
                      'hover:scale-[1.02] active:scale-[0.98]'
                    )}
                    style={{
                      backgroundColor: isSelected ? '#3E000C' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#3E000C' : '#3E000C15'}`,
                      color: isSelected ? '#f5fffa' : '#3E000C',
                    }}
                  >
                    <DynamicIcon
                      name={category.icon || 'Package'}
                      className={cn('w-5 h-5', isSelected ? 'text-[#f5fffa]' : 'text-[#3E000C]/70')}
                    />
                    <span className="text-sm font-medium">
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedCategory && (
              <Button
                onClick={handleNext}
                className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa]"
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
              <h2 className="text-2xl font-bold text-[#3E000C]">Детали</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">
                {selectedCategoryData?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">
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
                  className="text-base border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>

              {/* Quantity - only for shopping */}
              {taskType === 'shopping' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3E000C]">Количество</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                      className="flex-1 border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {units.slice(0, 4).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormData({ ...formData, unit: u })}
                          className={cn(
                            'px-3 py-2 rounded-xl text-sm font-medium transition-all border-2',
                          )}
                          style={{
                            backgroundColor: formData.unit === u ? '#3E000C' : '#FFFFFF',
                            color: formData.unit === u ? '#f5fffa' : '#3E000C',
                            borderColor: formData.unit === u ? '#3E000C' : '#3E000C20',
                          }}
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
                <label className="text-sm font-medium text-[#3E000C]">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={2}
                  className="border-[#3E000C]/20 focus:border-[#3E000C] resize-none bg-white rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!formData.title.trim()}
              className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa]"
            >
              Далее
            </Button>
          </div>
        )}

        {/* Step 4: Photo */}
        {step === 4 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Фото</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">
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
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-[#3E000C]/80 text-[#f5fffa]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer border-2 border-dashed border-[#3E000C]/20 bg-white">
                  <Camera className="w-10 h-10 text-[#3E000C]/40 mb-2" />
                  <span className="text-sm text-[#3E000C]/60">Нажмите для загрузки</span>
                  <span className="text-xs text-[#3E000C]/40 mt-1">или пропустите</span>
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
                className="flex-1 border-[#3E000C]/20 text-[#3E000C]"
              >
                Пропустить
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa]"
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
