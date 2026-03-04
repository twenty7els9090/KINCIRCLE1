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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <nav
        className={cn(
          'max-w-[400px] mx-auto pointer-events-auto',
          'rounded-full px-2 py-2',
          'flex items-center justify-around'
        )}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03), 0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'px-4 py-2 rounded-full',
                'transition-all duration-200 ease-out',
                'min-w-[70px]',
                isActive ? 'scale-105' : 'scale-100'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isActive && 'bg-burgundy/10'
                )}
              >
                <Icon
                  className={cn(
                    'transition-all duration-200',
                    isActive ? 'w-5 h-5 text-burgundy stroke-[2.5]' : 'w-5 h-5 text-[#8E8E93] stroke-[2]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive ? 'font-semibold text-burgundy' : 'font-normal text-[#8E8E93]'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
