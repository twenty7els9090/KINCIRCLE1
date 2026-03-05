'use client'

import { Bell, Settings, ChevronDown, Users } from 'lucide-react'
import { useUserStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onNotificationsClick?: () => void
  onSettingsClick?: () => void
}

export function Header({ onNotificationsClick, onSettingsClick }: HeaderProps) {
  const { user, families, currentFamilyId, setCurrentFamily } = useUserStore()
  const { activeTab } = useUIStore()

  const currentFamily = families.find((f) => f.id === currentFamilyId)

  const getTabTitle = () => {
    switch (activeTab) {
      case 'tasks':
        return 'Задачи'
      case 'events':
        return 'Мероприятия'
      case 'wishlist':
        return 'Wishlist'
      case 'profile':
        return 'Профиль'
      default:
        return 'KINCIRCLE'
    }
  }

  return (
    <header 
      className="sticky top-0 z-40"
      style={{
        background: 'linear-gradient(135deg, #8B1E3F 0%, #A93B5C 100%)',
      }}
    >
      <div className="max-w-[450px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Family selector or App name */}
          <div className="flex items-center gap-2">
            {activeTab === 'tasks' && families.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <Users className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">
                      {currentFamily?.name || 'Выберите семью'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id}
                      onClick={() => setCurrentFamily(family.id)}
                      className={cn(
                        'cursor-pointer',
                        family.id === currentFamilyId && 'bg-burgundy-100'
                      )}
                    >
                      <Users className="w-4 h-4 mr-2 text-burgundy" />
                      {family.name}
                      {family.id === currentFamilyId && (
                        <Badge 
                          className="ml-auto text-xs bg-burgundy text-white"
                        >
                          {family.members?.length || 0}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-2xl font-bold text-white">{getTabTitle()}</h1>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <Bell className="w-5 h-5 text-white" />
              {/* Notification badge */}
              <span 
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#F0D0D9' }}
              />
            </button>

            {/* User avatar / Settings */}
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-2 p-1 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <Avatar 
                className="w-8 h-8"
                style={{ border: '2px solid rgba(255, 255, 255, 0.3)' }}
              >
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || ''} />
                <AvatarFallback 
                  className="text-sm font-medium"
                  style={{ backgroundColor: '#F0D0D9', color: '#8B1E3F' }}
                >
                  {user?.first_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
