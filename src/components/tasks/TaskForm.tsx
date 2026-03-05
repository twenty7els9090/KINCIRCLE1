'use client'

import { useState, useEffect } from 'react'
import { Camera, X, ChevronRight, ChevronLeft, Package, Search, ShoppingCart, Home, MoreHorizontal, Edit3 } from 'lucide-react'
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
  const [itemsLoading, setItemsLoading] = useState(false)
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

  // Fetch items when category is selected
  useEffect(() => {
    if (selectedCategory && taskType) {
      fetchItems(selectedCategory)
    }
  }, [selectedCategory])

  const fetchItems = async (categoryId: string) => {
    setItemsLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('task_items')
        .select('*')
        .eq('category_id', categoryId)
        .order('order', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      setItems([])
    } finally {
      setItemsLoading(false)
    }
  }

  const handleNext = () => {
    setStep(step + 1)
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
    
    // For "other" type, auto-select the "Другое" category and go to details
    if (type === 'other') {
      const otherCategory = categories.find(c => c.type === 'other')
      if (otherCategory) {
        setSelectedCategory(otherCategory.id)
      }
      setStep(2) // Go directly to details
    } else {
      setStep(2)
    }
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
    setStep(4) // Go to details
  }

  const handleCustomItem = () => {
    setSelectedItem(null)
    setFormData({
      ...formData,
      title: '',
    })
    setStep(4) // Go to details
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

  // Calculate steps for progress indicator
  const getTotalSteps = () => {
    if (!taskType) return 4
    if (taskType === 'other') return 2 // Type -> Details
    return 4 // Type -> Category -> Search -> Details
  }

  const getCurrentStep = () => {
    if (!taskType) return 1
    if (taskType === 'other') {
      return step === 2 ? 2 : 1
    }
    return step
  }

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
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
              )}
              style={{
                width: s === getCurrentStep() ? 24 : 8,
                backgroundColor: s === getCurrentStep() ? '#3E000C' : '#3E000C20',
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
                      'w-full flex items-center gap-4 p-4 rounded-2xl',
                      'transition-all duration-200',
                      'active:scale-[0.98]',
                      'bg-white border border-[#3E000C]/10',
                      'hover:border-[#3E000C]/30'
                    )}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#3E000C]/5">
                      <Icon className="w-7 h-7 text-[#3E000C]" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-[#3E000C] text-lg">{type.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#3E000C]/40" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Category (for shopping and home) */}
        {step === 2 && (taskType === 'shopping' || taskType === 'home') && (
          <div className="space-y-5 pt-4">
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
                      'flex flex-col items-center gap-3 p-5 rounded-2xl',
                      'transition-all duration-200',
                      'active:scale-[0.98]'
                    )}
                    style={{
                      backgroundColor: isSelected ? '#3E000C' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#3E000C' : '#3E000C10'}`,
                    }}
                  >
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: isSelected ? '#f5fffa' : '#3E000C05' }}
                    >
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-14 h-14 object-contain" />
                      ) : (
                        <DynamicIcon
                          name={category.icon || 'Package'}
                          className={cn('w-10 h-10', isSelected ? 'text-[#3E000C]' : 'text-[#3E000C]/60')}
                        />
                      )}
                    </div>
                    <span 
                      className="text-sm font-semibold text-center"
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
                className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-14 rounded-xl font-semibold text-base"
              >
                Далее
              </Button>
            )}
          </div>
        )}

        {/* Step 2 for other type - direct details */}
        {step === 2 && taskType === 'other' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Детали</h2>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Название</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название задачи"
                  className="text-base border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={3}
                  className="border-[#3E000C]/20 focus:border-[#3E000C] resize-none bg-white rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
              className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-14 rounded-xl font-semibold text-base"
            >
              Создать
            </Button>
          </div>
        )}

        {/* Step 3: Search Items (for shopping and home) */}
        {step === 3 && (taskType === 'shopping' || taskType === 'home') && (
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Выберите</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">{selectedCategoryData?.name}</p>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3E000C]/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="pl-12 h-14 bg-white border-[#3E000C]/10 rounded-xl text-base"
              />
            </div>

            {/* Items grid */}
            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3E000C]/20 border-t-[#3E000C] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pb-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl',
                      'transition-all duration-200',
                      'active:scale-[0.95]',
                      'bg-white border border-[#3E000C]/5 hover:border-[#3E000C]/20'
                    )}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#3E000C]/5 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <Package className="w-7 h-7 text-[#3E000C]/30" />
                      )}
                    </div>
                    <span className="text-xs text-[#3E000C] text-center line-clamp-2 font-medium leading-tight">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Другое button - always at bottom */}
            <button
              onClick={handleCustomItem}
              className={cn(
                'w-full flex items-center justify-center gap-3 p-4 rounded-xl',
                'border-2 border-dashed border-[#3E000C]/30',
                'text-[#3E000C] font-semibold text-base',
                'transition-all duration-200',
                'hover:border-[#3E000C]/50 hover:bg-[#3E000C]/5',
                'active:scale-[0.98]'
              )}
            >
              <Edit3 className="w-5 h-5" />
              <span>Другое</span>
            </button>
          </div>
        )}

        {/* Step 4: Details for shopping */}
        {step === 4 && taskType === 'shopping' && (
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
                <label className="text-sm font-medium text-[#3E000C]">Что купить?</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Молоко, Хлеб..."
                  className="text-base border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>

              {/* Quantity - only for shopping */}
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
                          'px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2',
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

              {/* Photo upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Фото (опционально)</label>
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Task"
                      className="w-full h-40 rounded-2xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-[#3E000C]/80 text-[#f5fffa]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl cursor-pointer border-2 border-dashed border-[#3E000C]/20 bg-white">
                    <Camera className="w-8 h-8 text-[#3E000C]/40 mb-1" />
                    <span className="text-xs text-[#3E000C]/60">Добавить фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isLoading}
              className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-14 rounded-xl font-semibold text-base"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        )}

        {/* Step 4: Details for home */}
        {step === 4 && taskType === 'home' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E000C]">Детали</h2>
              <p className="text-sm text-[#3E000C]/60 mt-1">{selectedCategoryData?.name}</p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Название</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название задачи"
                  className="text-base border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={3}
                  className="border-[#3E000C]/20 focus:border-[#3E000C] resize-none bg-white rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
              className="w-full bg-[#3E000C] hover:bg-[#3E000C]/90 text-[#f5fffa] h-14 rounded-xl font-semibold text-base"
            >
              Создать
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
