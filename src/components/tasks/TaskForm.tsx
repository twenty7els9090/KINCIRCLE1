'use client'

import { useState, useEffect } from 'react'
import { Camera, X, ChevronRight, ChevronLeft, Package, Search, ShoppingCart, Home, MoreHorizontal, Edit3 } from 'lucide-react'
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

// Get image URL for item by name
function getItemImageUrl(name: string): string | null {
  const imageMap: Record<string, string> = {
    // МОЛОЧНОЕ
    'Молоко': '/images/items/milk.png',
    'Творог': '/images/items/cottage-cheese.png',
    'Кефир': '/images/items/kefir.png',
    'Ряженка': '/images/items/milk.png',
    'Йогурт': '/images/items/yogurt.png',
    'Сметана': '/images/items/milk.png',
    'Сливки': '/images/items/milk.png',
    'Сливочное масло': '/images/items/butter.png',
    'Сыр': '/images/items/cheese.png',
    'Яйца': '/images/items/eggs.png',
    'Сырки': '/images/items/cottage-cheese.png',
    'Твороженный сыр': '/images/items/cheese.png',
    'Плавленный сыр': '/images/items/cheese.png',
    // МЯСО И РЫБА
    'Курица': '/images/items/chicken.png',
    'Говядина': '/images/items/beef.png',
    'Свинина': '/images/items/beef.png',
    'Баранина': '/images/items/beef.png',
    'Индейка': '/images/items/chicken.png',
    'Утка': '/images/items/chicken.png',
    'Фарш': '/images/items/beef.png',
    'Колбаса': '/images/items/sausage.png',
    'Сосиски': '/images/items/sausage.png',
    'Сардельки': '/images/items/sausage.png',
    'Ветчина': '/images/items/sausage.png',
    'Бекон': '/images/items/sausage.png',
    'Рыба свежая': '/images/items/fish.png',
    'Рыба замороженная': '/images/items/fish.png',
    'Креветки': '/images/items/shrimp.png',
    'Крабовое мясо': '/images/items/shrimp.png',
    'Селедка': '/images/items/fish.png',
    'Семга': '/images/items/fish.png',
    'Форель': '/images/items/fish.png',
    // БАКАЛЕЯ
    'Мука': '/images/items/flour.png',
    'Сахар': '/images/items/sugar.png',
    'Соль': '/images/items/sugar.png',
    'Рис': '/images/items/rice.png',
    'Гречка': '/images/items/buckwheat.png',
    'Макароны': '/images/items/pasta.png',
    'Масло подсолнечное': '/images/items/oil.png',
    'Масло оливковое': '/images/items/oil.png',
    'Масло льна': '/images/items/oil.png',
    'Уксус': '/images/items/oil.png',
    'Соевый соус': '/images/items/oil.png',
    'Майонез': '/images/items/oil.png',
    'Кетчуп': '/images/items/oil.png',
    'Горчица': '/images/items/oil.png',
    'Хрен': '/images/items/oil.png',
    'Специи': '/images/items/flour.png',
    'Перец': '/images/items/flour.png',
    'Ванилин': '/images/items/flour.png',
    'Разрыхлитель': '/images/items/flour.png',
    'Дрожжи': '/images/items/flour.png',
    'Овсянка': '/images/items/buckwheat.png',
    'Манка': '/images/items/buckwheat.png',
    'Пшено': '/images/items/buckwheat.png',
    'Перловка': '/images/items/buckwheat.png',
    'Кукурузная крупа': '/images/items/buckwheat.png',
    'Чечевица': '/images/items/beans.png',
    'Какао': '/images/items/coffee.png',
    'Фасоль': '/images/items/beans.png',
    'Кукуруза консервированная': '/images/items/corn.png',
    'Горох': '/images/items/beans.png',
    // ОВОЩИ И ФРУКТЫ
    'Картофель': '/images/items/potato.png',
    'Лук': '/images/items/onion.png',
    'Морковь': '/images/items/carrot.png',
    'Чеснок': '/images/items/onion.png',
    'Капуста': '/images/items/vegetables.png',
    'Свекла': '/images/items/carrot.png',
    'Огурцы': '/images/items/cucumber.png',
    'Помидоры': '/images/items/tomato.png',
    'Перец болгарский': '/images/items/vegetables.png',
    'Баклажаны': '/images/items/vegetables.png',
    'Кабачки': '/images/items/vegetables.png',
    'Тыква': '/images/items/vegetables.png',
    'Зелень': '/images/items/vegetables.png',
    'Салат': '/images/items/vegetables.png',
    'Укроп': '/images/items/vegetables.png',
    'Петрушка': '/images/items/vegetables.png',
    'Кинза': '/images/items/vegetables.png',
    'Базилик': '/images/items/vegetables.png',
    'Яблоки': '/images/items/apple.png',
    'Груши': '/images/items/apple.png',
    'Бананы': '/images/items/banana.png',
    'Апельсины': '/images/items/orange.png',
    'Лимоны': '/images/items/orange.png',
    'Мандарины': '/images/items/orange.png',
    'Грейпфрут': '/images/items/orange.png',
    'Виноград': '/images/items/grapes.png',
    'Персики': '/images/items/apple.png',
    'Абрикосы': '/images/items/apple.png',
    'Сливы': '/images/items/apple.png',
    'Вишня': '/images/items/cherry.png',
    'Черешня': '/images/items/cherry.png',
    'Клубника': '/images/items/strawberry.png',
    'Малина': '/images/items/raspberry.png',
    'Ежевика': '/images/items/raspberry.png',
    'Крыжовник': '/images/items/raspberry.png',
    'Смородина': '/images/items/raspberry.png',
    'Земляника': '/images/items/strawberry.png',
    'Арбуз': '/images/items/watermelon.png',
    'Дыня': '/images/items/watermelon.png',
    'Киви': '/images/items/kiwi.png',
    'Ананас': '/images/items/pineapple.png',
    'Авокадо': '/images/items/avocado.png',
    'Гранат': '/images/items/apple.png',
    'Хурма': '/images/items/apple.png',
    'Кукуруза': '/images/items/corn.png',
    // НАПИТКИ
    'Чай': '/images/items/tea.png',
    'Кофе': '/images/items/coffee.png',
    'Сок': '/images/items/juice.png',
    'Вода минеральная': '/images/items/juice.png',
    'Вода питьевая': '/images/items/juice.png',
    'Газировка': '/images/items/juice.png',
    'Лимонад': '/images/items/juice.png',
    'Квас': '/images/items/juice.png',
    'Компот': '/images/items/juice.png',
    'Морс': '/images/items/juice.png',
    // ХЛЕБ И ВЫПЕЧКА
    'Хлеб белый': '/images/items/bread.png',
    'Хлеб черный': '/images/items/bread.png',
    'Батон': '/images/items/bread.png',
    'Багет': '/images/items/bread.png',
    'Лаваш': '/images/items/bread.png',
    'Булочки': '/images/items/bread.png',
    'Круассаны': '/images/items/bread.png',
    'Пирожки': '/images/items/bread.png',
    'Сушки': '/images/items/bread.png',
    'Пряники': '/images/items/bread.png',
    'Сухари': '/images/items/bread.png',
    // СЛАДОСТИ
    'Шоколад': '/images/items/chocolate.png',
    'Конфеты': '/images/items/chocolate.png',
    'Печенье': '/images/items/chocolate.png',
    'Торт': '/images/items/chocolate.png',
    'Пирожное': '/images/items/chocolate.png',
    'Мороженое': '/images/items/ice-cream.png',
    'Вафли': '/images/items/chocolate.png',
    'Зефир': '/images/items/chocolate.png',
    'Пастила': '/images/items/chocolate.png',
    'Марципан': '/images/items/chocolate.png',
    'Мед': '/images/items/honey.png',
    'Варенье': '/images/items/honey.png',
    'Сгущенка': '/images/items/honey.png',
    'Сахарная пудра': '/images/items/sugar.png',
    // МАРКЕТПЛЕЙСЫ
    'Wildberries': '/images/items/shopping.png',
    'Ozon': '/images/items/shopping.png',
    'Яндекс Маркет': '/images/items/shopping.png',
    'AliExpress': '/images/items/shopping.png',
    'Amazon': '/images/items/shopping.png',
    // АПТЕКА
    'Лекарства': '/images/items/pills.png',
    'Витамины': '/images/items/pills.png',
    'Бинты': '/images/items/pills.png',
    'Пластырь': '/images/items/pills.png',
    'Вата': '/images/items/pills.png',
    'Маски': '/images/items/pills.png',
    'Перчатки медицинские': '/images/items/pills.png',
    'Шприцы': '/images/items/pills.png',
    // БЫТОВАЯ ХИМИЯ
    'Порошок': '/images/items/detergent.png',
    'Гель для стирки': '/images/items/detergent.png',
    'Кондиционер для белья': '/images/items/detergent.png',
    'Средство для мытья посуды': '/images/items/cleaning.png',
    'Средство для окон': '/images/items/cleaning.png',
    'Средство для пола': '/images/items/cleaning.png',
    'Средство для ванной': '/images/items/cleaning.png',
    'Средство для унитаза': '/images/items/cleaning.png',
    'Отбеливатель': '/images/items/detergent.png',
    'Пятновыводитель': '/images/items/detergent.png',
    'Губки': '/images/items/cleaning.png',
    'Тряпки': '/images/items/cleaning.png',
    'Мешки для мусора': '/images/items/cleaning.png',
    'Прочее': '/images/items/cleaning.png',
    // УБОРКА
    'Помыть полы': '/images/items/cleaning.png',
    'Протереть пыль': '/images/items/cleaning.png',
    'Помыть окна': '/images/items/cleaning.png',
    'Пропылесосить': '/images/items/cleaning.png',
    'Убрать в ванной': '/images/items/cleaning.png',
    'Убрать на кухне': '/images/items/cooking.png',
    'Разобрать шкаф': '/images/items/cleaning.png',
    'Вынести мусор': '/images/items/cleaning.png',
    'Постирать вещи': '/images/items/laundry.png',
    // СТИРКА
    'Постирать одежду': '/images/items/laundry.png',
    'Постирать постельное': '/images/items/laundry.png',
    'Постирать полотенца': '/images/items/laundry.png',
    'Погладить': '/images/items/laundry.png',
    'Отдать в химчистку': '/images/items/laundry.png',
    // РЕМОНТ
    'Починить кран': '/images/items/tools.png',
    'Починить розетку': '/images/items/tools.png',
    'Повесить полку': '/images/items/tools.png',
    'Поменять лампочку': '/images/items/tools.png',
    'Заклеить обои': '/images/items/tools.png',
    'Починить дверь': '/images/items/tools.png',
    'Покрасить': '/images/items/tools.png',
    // САД
    'Полить цветы': '/images/items/garden.png',
    'Посадить растения': '/images/items/garden.png',
    'Подстричь газон': '/images/items/garden.png',
    'Убрать листья': '/images/items/garden.png',
    'Удобрить': '/images/items/garden.png',
    'Прополка': '/images/items/garden.png',
    // ГОТОВКА
    'Приготовить завтрак': '/images/items/cooking.png',
    'Приготовить обед': '/images/items/cooking.png',
    'Приготовить ужин': '/images/items/cooking.png',
    'Испечь пирог': '/images/items/cooking.png',
    'Сделать заготовки': '/images/items/cooking.png',
  }
  return imageMap[name] || null
}

// Item image component
function ItemImage({ name, className }: { name: string; className?: string }) {
  const imageUrl = getItemImageUrl(name)
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={className || 'w-10 h-10 object-contain'}
      />
    )
  }
  return <Package className={className || 'w-6 h-6 text-[#3E000C]/30'} />
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
  const [isCustomItem, setIsCustomItem] = useState(false)
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

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleTypeSelect = (type: 'shopping' | 'home' | 'other') => {
    setTaskType(type)
    setSelectedCategory('')
    setSelectedItem(null)
    setIsCustomItem(false)
    setItems([])
    setSearchQuery('')

    // For "other" type, auto-select the "Другое" category and go to details
    if (type === 'other') {
      const otherCategory = categories.find(c => c.type === 'other')
      if (otherCategory) {
        setSelectedCategory(otherCategory.id)
      }
      setIsCustomItem(true)
      setStep(2) // Go directly to details
    } else {
      setStep(2)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Auto navigate to items selection
    setStep(3)
  }

  const handleItemSelect = (item: TaskItem) => {
    setSelectedItem(item)
    setIsCustomItem(false)
    setFormData({
      ...formData,
      title: item.name,
      unit: item.unit || 'шт',
    })
    // For shopping, go to details, for home create directly
    if (taskType === 'shopping') {
      setStep(4)
    } else {
      // For home - create immediately
      handleSubmitWithData({
        title: item.name,
        type: 'home',
        category_id: selectedCategory,
      })
    }
  }

  const handleCustomItem = () => {
    setSelectedItem(null)
    setIsCustomItem(true)
    setFormData({
      ...formData,
      title: '',
    })
    // For shopping, go to details with photo option
    if (taskType === 'shopping') {
      setStep(4)
    } else {
      setStep(4)
    }
  }

  const handleSubmitWithData = (data: Partial<TaskFormData>) => {
    if (!data.title || !selectedCategory || !taskType) return

    onSubmit({
      title: data.title,
      description: formData.description || undefined,
      type: taskType,
      category_id: selectedCategory,
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      unit: taskType === 'shopping' ? formData.unit : undefined,
      image_url: isCustomItem ? imageUrl || undefined : undefined,
    })

    resetForm()
    onOpenChange(false)
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
      image_url: isCustomItem ? imageUrl || undefined : undefined,
    })

    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setStep(1)
    setTaskType(null)
    setSelectedCategory('')
    setSelectedItem(null)
    setIsCustomItem(false)
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
    if (taskType === 'other') return 2
    return 4
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #f5fffa 0%, #fff5f5 50%, #faf5ff 100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{
          paddingTop: '64px',
          borderBottom: '1px solid rgba(62, 0, 12, 0.06)',
        }}
      >
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="p-2.5 -ml-2 rounded-xl transition-all duration-200 hover:bg-[#3E000C]/5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(62, 0, 12, 0.08)',
            }}
          >
            <ChevronLeft className="w-5 h-5 text-[#3E000C]" />
          </button>
        ) : (
          <div className="w-11" />
        )}

        <div className="flex items-center gap-1.5">
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width: s === step ? 28 : 8,
                height: 4,
                background: s === step
                  ? 'linear-gradient(90deg, #3E000C 0%, #5a1525 100%)'
                  : 'rgba(62, 0, 12, 0.12)',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleClose}
          className="p-2.5 -mr-2 rounded-xl transition-all duration-200 hover:bg-[#3E000C]/5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(62, 0, 12, 0.08)',
          }}
        >
          <X className="w-5 h-5 text-[#3E000C]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Task Type */}
        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Что требуется?</h2>
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
                      'active:scale-[0.98]'
                    )}
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(62, 0, 12, 0.08)',
                      boxShadow: '0 4px 24px rgba(62, 0, 12, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                        boxShadow: '0 4px 16px rgba(62, 0, 12, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-[#1a1a1a] text-lg">{type.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#3E000C]/30" />
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
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Категория</h2>
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
                      background: isSelected
                        ? 'rgba(62, 0, 12, 0.06)'
                        : 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid ${isSelected ? 'rgba(62, 0, 12, 0.15)' : 'rgba(62, 0, 12, 0.08)'}`,
                      boxShadow: isSelected
                        ? '0 4px 20px rgba(62, 0, 12, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                        : '0 2px 12px rgba(62, 0, 12, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)'
                          : 'rgba(62, 0, 12, 0.06)',
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(62, 0, 12, 0.2)'
                          : 'none',
                      }}
                    >
                      <DynamicIcon
                        name={category.icon || 'Package'}
                        className={cn('w-8 h-8', isSelected ? 'text-white' : 'text-[#3E000C]/50')}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold text-center"
                      style={{ color: isSelected ? '#3E000C' : 'rgba(26, 26, 26, 0.7)' }}
                    >
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2 for other type - direct details */}
        {step === 2 && taskType === 'other' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Детали</h2>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Название</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название задачи"
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={3}
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Photo upload - only for "Другое" */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Фото (опционально)</label>
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
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                      }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center w-full h-32 rounded-2xl cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '2px dashed rgba(62, 0, 12, 0.15)',
                    }}
                  >
                    <Camera className="w-8 h-8 text-[#3E000C]/40 mb-1" />
                    <span className="text-xs text-[#3E000C]/40 font-medium">Добавить фото</span>
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

            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
              className="w-full h-14 rounded-xl font-semibold text-base text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                boxShadow: '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              Создать
            </button>
          </div>
        )}

        {/* Step 3: Search Items (for shopping and home) */}
        {step === 3 && (taskType === 'shopping' || taskType === 'home') && (
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Выберите</h2>
              <p className="text-sm text-[#1a1a1a]/50 mt-1">{selectedCategoryData?.name}</p>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3E000C]/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-12 h-14 rounded-xl text-base text-[#1a1a1a] placeholder-black/30 focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(62, 0, 12, 0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                }}
              />
            </div>

            {/* Items grid */}
            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <div
                  className="w-10 h-10 rounded-xl"
                  style={{
                    border: '2px solid rgba(62, 0, 12, 0.1)',
                    borderTopColor: '#3E000C',
                    animation: 'spin 1s linear infinite',
                  }}
                />
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
                      'active:scale-[0.95]'
                    )}
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(62, 0, 12, 0.06)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(62, 0, 12, 0.04)' }}
                    >
                      <ItemImage name={item.name} className="w-8 h-8 object-contain" />
                    </div>
                    <span className="text-xs text-[#1a1a1a] text-center line-clamp-2 font-medium leading-tight">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Другое button */}
            <button
              onClick={handleCustomItem}
              className={cn(
                'w-full flex items-center justify-center gap-3 p-4 rounded-xl',
                'transition-all duration-200',
                'active:scale-[0.98]'
              )}
              style={{
                background: 'rgba(62, 0, 12, 0.04)',
                border: '2px dashed rgba(62, 0, 12, 0.15)',
              }}
            >
              <Edit3 className="w-5 h-5 text-[#3E000C]" />
              <span className="text-[#3E000C] font-semibold text-base">Другое</span>
            </button>
          </div>
        )}

        {/* Step 4: Details for shopping */}
        {step === 4 && taskType === 'shopping' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Детали</h2>
              <p className="text-sm text-[#1a1a1a]/50 mt-1">
                {selectedCategoryData?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Что купить?</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Молоко, Хлеб..."
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Количество</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1"
                    className="flex-1 text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(62, 0, 12, 0.08)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                    }}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {units.slice(0, 4).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setFormData({ ...formData, unit: u })}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        )}
                        style={{
                          background: formData.unit === u
                            ? 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)'
                            : 'rgba(62, 0, 12, 0.06)',
                          color: formData.unit === u ? '#FFFFFF' : '#1a1a1a',
                          boxShadow: formData.unit === u
                            ? '0 2px 8px rgba(62, 0, 12, 0.2)'
                            : 'none',
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
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={2}
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Photo upload - only for custom items */}
              {isCustomItem && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1a1a1a]/60">Фото (опционально)</label>
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
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                        }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center w-full h-32 rounded-2xl cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '2px dashed rgba(62, 0, 12, 0.15)',
                      }}
                    >
                      <Camera className="w-8 h-8 text-[#3E000C]/40 mb-1" />
                      <span className="text-xs text-[#3E000C]/40 font-medium">Добавить фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isLoading}
              className="w-full h-14 rounded-xl font-semibold text-base text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                boxShadow: '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        )}

        {/* Step 4: Details for home */}
        {step === 4 && taskType === 'home' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Детали</h2>
              <p className="text-sm text-[#1a1a1a]/50 mt-1">{selectedCategoryData?.name}</p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Название</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название задачи"
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a1a1a]/60">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавьте детали..."
                  rows={3}
                  className="w-full text-base px-4 py-3.5 rounded-xl text-[#1a1a1a] placeholder-black/30 focus:outline-none resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              {/* Photo upload - only for custom items */}
              {isCustomItem && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1a1a1a]/60">Фото (опционально)</label>
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
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                        }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center w-full h-32 rounded-2xl cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '2px dashed rgba(62, 0, 12, 0.15)',
                      }}
                    >
                      <Camera className="w-8 h-8 text-[#3E000C]/40 mb-1" />
                      <span className="text-xs text-[#3E000C]/40 font-medium">Добавить фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isLoading}
              className="w-full h-14 rounded-xl font-semibold text-base text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                boxShadow: '0 4px 16px rgba(62, 0, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
