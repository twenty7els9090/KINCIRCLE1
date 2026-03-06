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
        return 'Вишлист'
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
        paddingTop: '64px',
        background: 'linear-gradient(180deg, rgba(12, 15, 30, 0.95) 0%, rgba(12, 15, 30, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="max-w-[450px] mx-auto px-4 pb-3">
        <div className="flex items-center justify-between">
          {/* Left: Family selector or App name */}
          <div className="flex items-center gap-2">
            {activeTab === 'tasks' && families.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(26, 31, 53, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Users className="w-4 h-4 text-[#6C5CE7]" />
                    <span className="font-medium text-white">
                      {currentFamily?.name || 'Выберите семью'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-48"
                  style={{
                    background: 'rgba(26, 31, 53, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id}
                      onClick={() => setCurrentFamily(family.id)}
                      className={cn(
                        'cursor-pointer text-white hover:bg-white/10 focus:bg-white/10',
                        family.id === currentFamilyId && 'bg-white/5'
                      )}
                    >
                      <Users className="w-4 h-4 mr-2 text-[#6C5CE7]" />
                      {family.name}
                      {family.id === currentFamilyId && (
                        <Badge 
                          className="ml-auto text-xs"
                          style={{
                            background: 'rgba(108, 92, 231, 0.2)',
                            color: '#6C5CE7',
                            border: '1px solid rgba(108, 92, 231, 0.3)',
                          }}
                        >
                          {family.members?.length || 0}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {getTabTitle()}
              </h1>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2.5 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Bell className="w-5 h-5 text-white/70" />
              {/* Notification badge */}
              <span 
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                style={{
                  background: '#6C5CE7',
                  boxShadow: '0 0 8px rgba(108, 92, 231, 0.6)',
                }}
              />
            </button>

            {/* User avatar / Settings */}
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-2 p-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Avatar 
                className="w-9 h-9"
                style={{
                  boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.4)',
                }}
              >
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || ''} />
                <AvatarFallback 
                  className="text-sm font-medium"
                  style={{
                    background: 'linear-gradient(145deg, #6C5CE7, #5F5FEF)',
                    color: '#FFFFFF',
                  }}
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
