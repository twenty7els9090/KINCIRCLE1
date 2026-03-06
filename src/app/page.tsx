'use client'

import { useEffect, useState, useCallback } from 'react'
import { TabBar } from '@/components/layout/TabBar'
import { Header } from '@/components/layout/Header'
import { TasksSection } from '@/components/tasks/TasksSection'
import { EventsSection } from '@/components/events/EventsSection'
import { WishlistSection } from '@/components/wishlist/WishlistSection'
import { ProfileSection } from '@/components/profile/ProfileSection'
import { BirthdayReminders } from '@/components/shared/BirthdayReminders'
import { useUIStore, useUserStore, useFriendsStore } from '@/store'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { activeTab } = useUIStore()
  const { user, setUser, setFamilies, setLoading, isLoading } = useUserStore()
  const { friends } = useFriendsStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [birthdayUsers, setBirthdayUsers] = useState<any[]>([])

  const fetchUserFamilies = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/families?userId=${userId}`)
      const data = await response.json()
      
      if (data.families) {
        setFamilies(data.families)
      }
    } catch (error) {
      console.error('Error fetching families:', error)
    }
  }, [setFamilies])

  const authenticateWithTelegram = useCallback(async (tgUser: any, initData: string) => {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })

      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
        await fetchUserFamilies(data.user.id)
        return true
      }
    } catch (error) {
      console.error('Error authenticating:', error)
    }
    return false
  }, [setUser, fetchUserFamilies])

  const initializeApp = useCallback(async () => {
    setLoading(true)

    try {
      // Check if running in Telegram WebApp with retry
      let tg: any = null
      let attempts = 0
      const maxAttempts = 10

      // Wait for Telegram WebApp to be ready
      while (!tg && attempts < maxAttempts) {
        if (typeof window !== 'undefined') {
          tg = (window as any).Telegram?.WebApp
        }
        if (!tg) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
      }

      if (tg) {
        console.log('Telegram WebApp detected, initializing...')
        
        // Expand the mini app
        tg.expand()
        
        // Call ready() to signal that app is ready
        if (tg.ready) {
          tg.ready()
        }

        // Set dark theme for Telegram
        if (tg.setHeaderColor) {
          tg.setHeaderColor('#0C0F1E')
        }

        // Get init data
        const initData = tg.initData
        const tgUser = tg.initDataUnsafe?.user

        console.log('Telegram user:', tgUser)

        if (tgUser && initData) {
          const success = await authenticateWithTelegram(tgUser, initData)
          if (success) {
            console.log('Successfully authenticated with Telegram')
          } else {
            console.log('Failed to authenticate, falling back to demo')
            await initializeDemoMode()
          }
        } else {
          console.log('No Telegram user data, falling back to demo')
          await initializeDemoMode()
        }
      } else {
        console.log('Telegram WebApp not found after retries, using demo mode')
        await initializeDemoMode()
      }
    } catch (error) {
      console.error('Error initializing app:', error)
      await initializeDemoMode()
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [setLoading, authenticateWithTelegram])

  const initializeDemoMode = async () => {
    const demoUser = {
      id: 'demo-user-id',
      telegram_id: 123456789,
      username: 'demo_user',
      first_name: 'Demo',
      last_name: 'User',
      avatar_url: null,
      birthday: '1990-05-15',
      chat_id: 123456789,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setUser(demoUser)
    
    setFamilies([{
      id: 'demo-family-id',
      name: 'Демо семья',
      created_by: 'demo-user-id',
      created_at: new Date().toISOString(),
      members: [{
        id: 'demo-member-id',
        family_id: 'demo-family-id',
        user_id: 'demo-user-id',
        role: 'admin',
        joined_at: new Date().toISOString(),
        user: demoUser,
      }],
    }])
  }

  // Initialize Telegram WebApp and authenticate
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Get upcoming birthdays from friends
  useEffect(() => {
    const upcomingBirthdays = friends
      .filter((f) => f.birthday)
      .map((f) => ({
        id: f.id,
        first_name: f.first_name,
        last_name: f.last_name,
        avatar_url: f.avatar_url,
        birthday: f.birthday!,
        hasWishlist: true,
      }))
      .filter((f) => {
        const birthday = new Date(f.birthday)
        const today = new Date()
        birthday.setFullYear(today.getFullYear())
        if (birthday < today) birthday.setFullYear(today.getFullYear() + 1)
        
        const daysUntil = Math.ceil(
          (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntil <= 30
      })
      .slice(0, 5)
    
    setBirthdayUsers(upcomingBirthdays)
  }, [friends])

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #0C0F1E 0%, #1A1F35 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #6C5CE7, #5F5FEF)',
              boxShadow: '0 0 30px rgba(108, 92, 231, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <p className="text-white/50">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex flex-col max-w-[450px] mx-auto"
      style={{
        background: 'linear-gradient(145deg, #0C0F1E 0%, #1A1F35 100%)',
      }}
    >
      {/* Header */}
      <Header />

      {/* Birthday reminders (show on tasks tab) */}
      {activeTab === 'tasks' && birthdayUsers.length > 0 && (
        <div className="px-4 pt-4">
          <BirthdayReminders users={birthdayUsers} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'tasks' && <TasksSection />}
        {activeTab === 'events' && <EventsSection />}
        {activeTab === 'wishlist' && <WishlistSection />}
        {activeTab === 'profile' && <ProfileSection />}
      </main>

      {/* Tab bar */}
      <TabBar />
    </div>
  )
}
