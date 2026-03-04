'use client'

import { ListTodo, Calendar, Gift, User } from 'lucide-react'
import { useUIStore, type TabId } from '@/store'
import { cn } from '@/lib/utils'

interface TabItem {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: TabItem[] = [
  { id: 'tasks', label: 'Задачи', icon: ListTodo },
  { id: 'events', label: 'События', icon: Calendar },
  { id: 'wishlist', label: 'Вишлист', icon: Gift },
  { id: 'profile', label: 'Профиль', icon: User },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F0E8E8] safe-area-bottom">
      <div className="max-w-[450px] mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200',
                'min-w-[60px] rounded-xl',
                isActive ? 'text-burgundy' : 'text-[#8E8E93]'
              )}
            >
              <Icon
                className={cn(
                  'transition-all duration-200',
                  isActive ? 'w-6 h-6 stroke-[2.5]' : 'w-6 h-6 stroke-[2]'
                )}
              />
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive ? 'font-medium' : 'font-normal'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
