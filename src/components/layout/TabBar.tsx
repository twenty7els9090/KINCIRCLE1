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
          'rounded-2xl px-2 py-2',
          'flex items-center justify-around'
        )}
        style={{
          background: 'linear-gradient(135deg, #8B1E3F 0%, #A93B5C 50%, #C2587A 100%)',
          boxShadow: '0 8px 32px rgba(139, 30, 63, 0.4)',
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
                'flex flex-col items-center justify-center',
                'px-4 py-2 rounded-xl',
                'transition-all duration-300 ease-out',
                isActive ? 'bg-white/20 scale-105' : 'hover:bg-white/10 scale-100'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-300',
                  isActive ? 'text-white stroke-[2.5]' : 'text-white/60 stroke-[2]'
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-all duration-300',
                  isActive ? 'text-white' : 'text-white/50'
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
