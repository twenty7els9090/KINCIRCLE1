'use client'

import { ListTodo, Calendar, Gift, User } from 'lucide-react'
import { useUIStore, type TabId } from '@/store'
import { cn } from '@/lib/utils'

interface TabItem {
  id: TabId
  icon: React.ComponentType<{ className?: string }>
}

const tabs: TabItem[] = [
  { id: 'tasks', icon: ListTodo },
  { id: 'events', icon: Calendar },
  { id: 'wishlist', icon: Gift },
  { id: 'profile', icon: User },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <nav
        className={cn(
          'max-w-[350px] mx-auto pointer-events-auto',
          'rounded-full px-2 py-2',
          'flex items-center justify-around',
          'backdrop-blur-xl'
        )}
        style={{
          backgroundColor: 'rgba(62, 0, 12, 0.25)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
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
                  isActive && 'bg-[#f5fffa]'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'text-[#3E000C] stroke-[2.5]' : 'text-[#f5fffa]/80 stroke-[2]'
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
