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
          backgroundColor: '#3E000C',
          boxShadow: '0 4px 20px rgba(62, 0, 12, 0.3)',
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
                  isActive && 'bg-[#FFECD1]'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'text-[#3E000C] stroke-[2.5]' : 'text-[#FFECD1]/60 stroke-[2]'
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
