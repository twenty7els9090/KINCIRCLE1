'use client'

import { useState, useEffect, useCallback } from 'react'
import { Camera, X, ChevronRight, ChevronLeft, Package, Search, ShoppingCart, Home, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { TaskCategory, User, TaskItem } from '@/lib/supabase/database.types'
import * as LucideIcons from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

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
    icon: ShoppingCart,
  },
  { 
    value: 'home' as const, 
    label: 'Дом', 
    icon: Home,
  },
  { 
    value: 'other' as const, 
    label: 'Другое', 
    icon: MoreHorizontal,
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
  const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null)
  const [items, setItems] = useState<TaskItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'шт',
  })

  // Filter categories by type
  const filteredCategories = taskType ? categories.filter((c) => c.type === taskType) : []

  // Filter items by search query
  const filteredItems = searchQuery 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items

  const handleNext = () => {
    if (step < 4) {
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
    setSelectedItem(null)
    setItems([])
    setSearchQuery('')
    setStep(2)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleItemSelect = (item: TaskItem) => {
    setSelectedItem(item)
    setFormData({
      ...formData,
      title: item.name,
      unit: item.unit || 'шт',
    })
    if (item.image_url) {
      setImageUrl(item.image_url)
    }
    setStep(3)
  }

  const handleCustomItem = () => {
    setSelectedItem(null)
    setFormData({
      ...formData,
      title: '',
    })
    setStep(3)
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
    setSelectedItem(null)
    setItems([])
    setSearchQuery('')
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
      <div className="flex items-center justify-between p-4 border-b border-[#3E000C]/10" style={{ paddingTop: '64px' }}>
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
          <div className="space-y-8 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Что требуется?</h2>
            </div>

            <div className="space-y-3">
              {taskTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-2xl',
                      'transition-all duration-200',
                      'active:scale-[0.98]',
                      'bg-white border border-[#3E000C]/10'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#3E000C]/5">
                        <Icon className="w-6 h-6 text-[#3E000C]" />
                      </div>
                      <span className="font-medium text-[#3E000C] text-lg">{type.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#3E000C]/40" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Категория</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-2xl',
                      'transition-all duration-200',
                      'active:scale-[0.98]'
                    )}
                    style={{
                      backgroundColor: isSelected ? '#3E000C' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#3E000C' : '#3E000C10'}`,
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: isSelected ? '#f5fffa' : '#3E000C08' }}
                    >
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <DynamicIcon
                          name={category.icon || 'Package'}
                          className={cn('w-8 h-8', isSelected ? 'text-[#3E000C]' : 'text-[#3E000C]/60')}
                        />
                      )}
                    </div>
                    <span 
                      className="text-sm font-medium text-center"
                      style={{ color: isSelected ? '#f5fffa' : '#3E000C' }}
                    >
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedCategory && (
              <Button
                onClick={handleNext}
                className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-12 rounded-xl"
              >
                Далее
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Search Items (for shopping) or Details (for others) */}
        {step === 3 && taskType === 'shopping' && (
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Выберите товар</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">{selectedCategoryData?.name}</p>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3E000C]/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="pl-10 h-12 bg-white border-[#3E000C]/10 rounded-xl"
              />
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pb-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl',
                    'transition-all duration-200',
                    'active:scale-[0.95]',
                    'bg-white border border-[#3E000C]/5'
                  )}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#3E000C]/5 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-[#3E000C]/30" />
                    )}
                  </div>
                  <span className="text-xs text-[#3E000C] text-center line-clamp-2">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom item button */}
            <button
              onClick={handleCustomItem}
              className="w-full p-4 rounded-xl border-2 border-dashed border-[#3E000C]/20 text-[#3E000C]/60 font-medium"
            >
              Свой вариант
            </button>
          </div>
        )}

        {/* Step 3 for non-shopping or Step 4: Details */}
        {((step === 3 && taskType !== 'shopping') || step === 4) && (
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
              onClick={taskType === 'shopping' ? handleNext : handleSubmit}
              disabled={!formData.title.trim()}
              className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-12 rounded-xl"
            >
              {taskType === 'shopping' ? 'Далее' : 'Создать'}
            </Button>
          </div>
        )}

        {/* Step 4: Photo (only for shopping) */}
        {step === 4 && taskType === 'shopping' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Фото</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">Опционально</p>
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
                className="flex-1 border-[#3E000C]/20 text-[#3E000C] h-12 rounded-xl"
              >
                Пропустить
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-12 rounded-xl"
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
