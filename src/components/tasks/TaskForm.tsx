'use client'

import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { TaskCategory, User } from '@/lib/supabase/database.types'

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
  { value: 'shopping', label: '🛒 Покупки' },
  { value: 'home', label: '🏠 Дом' },
  { value: 'other', label: '📋 Другое' },
]

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  isLoading,
}: TaskFormProps) {
  const [taskType, setTaskType] = useState<'shopping' | 'home' | 'other'>('shopping')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'шт',
  })

  // Filter categories by type
  const filteredCategories = categories.filter((c) => c.type === taskType)

  const handleSubmit = () => {
    if (!formData.title || !selectedCategory) return

    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      type: taskType,
      category_id: selectedCategory,
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      unit: taskType === 'shopping' ? formData.unit : undefined,
      image_url: imageUrl || undefined,
    })

    // Reset form
    setFormData({
      title: '',
      description: '',
      quantity: '',
      unit: 'шт',
    })
    setSelectedCategory('')
    setImageUrl('')
    setTaskType('shopping')
    onOpenChange(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  // Reset category when type changes
  const handleTypeChange = (value: string) => {
    setTaskType(value as 'shopping' | 'home' | 'other')
    setSelectedCategory('') // Reset category when type changes
  }

  const canSubmit = formData.title && selectedCategory

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-burgundy">Новая задача</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task type selector */}
          <div className="space-y-2">
            <Label>Тип задачи</Label>
            <Select value={taskType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {taskType === 'shopping' ? 'Что купить? *' : 'Название задачи *'}
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
            />
          </div>

          {/* Category - REQUIRED dropdown */}
          <div className="space-y-2">
            <Label>Категория *</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-[#8E8E93]">
                    Нет категорий для этого типа
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and unit - only for shopping */}
          {taskType === 'shopping' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Количество (опц.)</Label>
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
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Добавьте детали..."
              rows={2}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Фото (опционально)</Label>
            {imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Task"
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-[#E5E0E0] cursor-pointer hover:border-burgundy transition-colors">
                <Camera className="w-6 h-6 text-[#8E8E93]" />
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            disabled={isLoading || !canSubmit}
            style={{ backgroundColor: '#8B1E3F', color: 'white' }}
            onClick={handleSubmit}
          >
            {isLoading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
