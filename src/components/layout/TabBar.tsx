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
  { id: 'wishlist', label: 'Wishlist', icon: Gift },
  { id: 'profile', label: 'Профиль', icon: User },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <nav
        className={cn(
          'max-w-[350px] mx-auto pointer-events-auto',
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
                'flex items-center justify-center',
                'p-3 rounded-full',
                'transition-all duration-200 ease-out',
                isActive ? 'scale-110' : 'scale-100'
              )}
            >
              <div
                className={cn(
                  'p-2.5 rounded-full transition-all duration-200',
                  isActive && 'bg-burgundy'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'text-white stroke-[2.5]' : 'text-[#8E8E93] stroke-[2]'
                  )}
                />
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
