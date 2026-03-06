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
          'rounded-3xl px-2 py-2',
          'flex items-center justify-around',
        )}
        style={{
          background: 'rgba(62, 0, 12, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
                'px-4 py-2 rounded-2xl',
                'transition-all duration-300 ease-out',
                'active:scale-95'
              )}
              style={{
                background: isActive
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                boxShadow: isActive
                  ? '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : 'none',
              }}
            >
              <div
                className={cn(
                  'transition-all duration-300',
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive
                      ? 'text-white'
                      : 'text-white/50'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold transition-all duration-300',
                  isActive
                    ? 'text-white'
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
