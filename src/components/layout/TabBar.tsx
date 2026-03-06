'use client'

import { ListTodo, Calendar, Gift, User } from 'lucide-react'
import { useUIStore, type TabId } from '@/store'
import { cn } from '@/lib/utils'

interface TabItem {
  id: TabId
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const tabs: TabItem[] = [
  { id: 'tasks', icon: ListTodo, label: 'Задачи' },
  { id: 'events', icon: Calendar, label: 'События' },
  { id: 'wishlist', icon: Gift, label: 'Вишлист' },
  { id: 'profile', icon: User, label: 'Профиль' },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <nav
        className={cn(
          'max-w-[90%] mx-auto pointer-events-auto',
          'rounded-full px-4 py-3',
          'flex items-center justify-around',
        )}
        style={{
          background: 'rgba(26, 31, 53, 0.5)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.5)',
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
                'flex flex-col items-center gap-1',
                'px-4 py-2 rounded-full',
                'transition-all duration-200 ease-out',
                'active:scale-95'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isActive && 'bg-[#6C5CE7]/20'
                )}
                style={{
                  boxShadow: isActive
                    ? '0 0 20px rgba(108, 92, 231, 0.3)'
                    : 'none'
                }}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive 
                      ? 'text-[#6C5CE7]' 
                      : 'text-white/50'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive 
                    ? 'text-[#6C5CE7]' 
                    : 'text-white/50'
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
