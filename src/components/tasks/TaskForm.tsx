'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { CategorySelector } from './CategorySelector'
import type { TaskCategory, User } from '@/lib/supabase/database.types'

const taskSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  description: z.string().optional(),
  type: z.enum(['shopping', 'home', 'other']),
  category_id: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional(),
  price: z.number().optional().nullable(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormData & { image_url?: string }) => void
  categories: TaskCategory[]
  familyMembers?: User[]
  isLoading?: boolean
}

const units = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'м']

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  familyMembers = [],
  isLoading,
}: TaskFormProps) {
  const [taskType, setTaskType] = useState<'shopping' | 'home' | 'other'>('shopping')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<string>('')
  const [unit, setUnit] = useState<string>('шт')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'shopping',
    },
  })

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      ...data,
      category_id: selectedCategory,
      quantity: quantity ? parseFloat(quantity) : null,
      unit: taskType === 'shopping' ? unit : undefined,
      image_url: imageUrl || undefined,
    })
    // Reset form
    reset()
    setSelectedCategory(null)
    setImageUrl(null)
    setQuantity('')
    setUnit('шт')
    onOpenChange(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, just create a local URL preview
    // In production, upload to Supabase Storage
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-burgundy">Новая задача</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Task type selector */}
          <div className="flex gap-2">
            {(['shopping', 'home', 'other'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={taskType === type ? 'default' : 'outline'}
                onClick={() => {
                  setTaskType(type)
                  setValue('type', type)
                  setSelectedCategory(null)
                }}
                className={taskType === type ? 'bg-burgundy hover:bg-burgundy-light' : ''}
              >
                {type === 'shopping' && '🛒 Покупки'}
                {type === 'home' && '🏠 Дом'}
                {type === 'other' && '📋 Другое'}
              </Button>
            ))}
          </div>

          {/* Category selector for shopping */}
          {taskType === 'shopping' && (
            <CategorySelector
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              type="shopping"
            />
          )}

          {/* Category selector for home */}
          {taskType === 'home' && (
            <CategorySelector
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              type="home"
            />
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {taskType === 'shopping' ? 'Что купить?' : 'Название задачи'}
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={
                taskType === 'shopping'
                  ? 'Например: Молоко, Хлеб...'
                  : 'Название задачи'
              }
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Quantity and unit for shopping */}
          {taskType === 'shopping' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Единица</Label>
                <Select value={unit} onValueChange={setUnit}>
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
              {...register('description')}
              placeholder="Добавьте детали..."
              rows={2}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Цена (опционально)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              placeholder="0.00"
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
                  onClick={() => setImageUrl(null)}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-burgundy hover:bg-burgundy-light"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
