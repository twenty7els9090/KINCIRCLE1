'use client'

import { useState } from 'react'
import { Camera, X, ChevronRight, ChevronLeft, ShoppingBag, Home, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
    icon: ShoppingBag, 
    description: 'Продукты, вещи, товары',
    gradient: 'from-blue-400 to-blue-600'
  },
  { 
    value: 'home' as const, 
    label: 'Дом', 
    icon: Home, 
    description: 'Уборка, ремонт, сад',
    gradient: 'from-green-400 to-green-600'
  },
  { 
    value: 'other' as const, 
    label: 'Другое', 
    icon: Sparkles, 
    description: 'Всё остальное',
    gradient: 'from-purple-400 to-purple-600'
  },
]

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name]
  return Icon ? <Icon className={className} /> : <Sparkles className={className} />
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
    setSelectedCategory('') // Reset category when type changes
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

    // Reset all
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

  // Check if can proceed
  const canProceed = () => {
    switch (step) {
      case 1:
        return taskType !== null
      case 2:
        return selectedCategory !== ''
      case 3:
        return formData.title.trim() !== ''
      case 4:
        return true
      default:
        return false
    }
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-burgundy text-lg">
              Новая задача
            </DialogTitle>
            {/* Step indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    s === step ? 'w-6 bg-burgundy' : 'bg-[#E5E0E0]'
                  )}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 min-h-[400px]">
          {/* Step 1: Task Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#1C1C1E]">Что добавляем?</h2>
                <p className="text-sm text-[#8E8E93] mt-1">Выберите тип задачи</p>
              </div>

              <div className="space-y-3">
                {taskTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = taskType === type.value
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleTypeSelect(type.value)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl',
                        'border-2 transition-all duration-200',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        isSelected
                          ? 'border-burgundy bg-burgundy/5'
                          : 'border-[#F0E8E8] hover:border-burgundy/50'
                      )}
                    >
                      <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center',
                        'bg-gradient-to-br',
                        type.gradient
                      )}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-[#1C1C1E]">{type.label}</p>
                        <p className="text-sm text-[#8E8E93]">{type.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#8E8E93]" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-[#1C1C1E]">Категория</h2>
                  <p className="text-sm text-[#8E8E93]">Уточните, что именно</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pb-2">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-2xl',
                        'border-2 transition-all duration-200',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        isSelected
                          ? 'border-burgundy bg-burgundy/5'
                          : 'border-[#F0E8E8] hover:border-burgundy/50'
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
                        'text-sm font-medium text-center',
                        isSelected ? 'text-burgundy' : 'text-[#1C1C1E]'
                      )}>
                        {category.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-burgundy" />
                        </div>
                      )}
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#8E8E93]" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-[#1C1C1E]">Детали</h2>
                  <p className="text-sm text-[#8E8E93]">
                    {selectedCategoryData?.name} • {taskTypes.find(t => t.value === taskType)?.label}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {taskType === 'shopping' ? 'Что купить? *' : 'Название *'}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    taskType === 'shopping'
                      ? 'Например: Молоко, Хлеб...'
                      : 'Название задачи'
                  }
                  className="text-base"
                />
              </div>

              {/* Quantity and unit - only for shopping */}
              {taskType === 'shopping' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Количество</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Единица</Label>
                    <div className="flex flex-wrap gap-1">
                      {units.map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormData({ ...formData, unit: u })}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm transition-all',
                            formData.unit === u
                              ? 'bg-burgundy text-white'
                              : 'bg-[#F8F5F5] text-[#1C1C1E] hover:bg-[#F0E8E8]'
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
                <Label htmlFor="description">Описание (опц.)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={2}
                />
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#8E8E93]" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-[#1C1C1E]">Фото</h2>
                  <p className="text-sm text-[#8E8E93]">Добавьте изображение (опционально)</p>
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-3">
                {imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Task"
                      className="w-full h-48 rounded-2xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-[#E5E0E0] cursor-pointer hover:border-burgundy transition-colors bg-[#FAFAFA]">
                    <Camera className="w-10 h-10 text-[#8E8E93] mb-2" />
                    <span className="text-sm text-[#8E8E93]">Нажмите для загрузки</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  Без фото
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-burgundy hover:bg-burgundy-light text-white"
                >
                  {isLoading ? 'Создание...' : 'Создать задачу'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
