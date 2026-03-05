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
import { getSupabaseClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { activeTab } = useUIStore()
  const { user, setUser, setFamilies, setLoading, isLoading } = useUserStore()
  const { friends, setFriends, setPendingRequests } = useFriendsStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [birthdayUsers, setBirthdayUsers] = useState<any[]>([])

  // Fetch friends globally
  const fetchFriends = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          created_at,
          friend:users!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', userId)

      if (!error && data) {
        const friendsList = data.map((f: any) => ({
          ...f.friend,
          friendship_created_at: f.created_at,
        }))
        setFriends(friendsList)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }, [setFriends])

  // Fetch pending friend requests
  const fetchPendingRequests = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: received } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')

      if (received) {
        setPendingRequests(received as any)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }, [setPendingRequests])

  const fetchUserFamilies = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          family:family_groups(
            *,
            members:family_members(
              *,
              user:users(*)
            )
          )
        `)
        .eq('user_id', userId)

      if (!error && data) {
        const familiesList = data.map((fm: any) => fm.family)
        setFamilies(familiesList)
        
        // Set current family to first one if exists
        if (familiesList.length > 0 && familiesList[0].id) {
          useUserStore.getState().setCurrentFamily(familiesList[0].id)
        }
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
        return data.user
      }
    } catch (error) {
      console.error('Error authenticating:', error)
    }
    return null
  }, [setUser])

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

      let authenticatedUser = null

      if (tg) {
        console.log('Telegram WebApp detected, initializing...')
        
        // Expand the mini app
        tg.expand()
        
        // Call ready() to signal that app is ready
        if (tg.ready) {
          tg.ready()
        }

        // Get init data
        const initData = tg.initData
        const tgUser = tg.initDataUnsafe?.user

        console.log('Telegram user:', tgUser)

        if (tgUser && initData) {
          authenticatedUser = await authenticateWithTelegram(tgUser, initData)
          if (authenticatedUser) {
            console.log('Successfully authenticated with Telegram')
          } else {
            console.log('Failed to authenticate, falling back to demo')
            authenticatedUser = await initializeDemoMode()
          }
        } else {
          console.log('No Telegram user data, falling back to demo')
          authenticatedUser = await initializeDemoMode()
        }
      } else {
        console.log('Telegram WebApp not found after retries, using demo mode')
        authenticatedUser = await initializeDemoMode()
      }

      // Load all data after authentication
      if (authenticatedUser) {
        await Promise.all([
          fetchUserFamilies(authenticatedUser.id),
          fetchFriends(authenticatedUser.id),
          fetchPendingRequests(authenticatedUser.id),
        ])
      }
    } catch (error) {
      console.error('Error initializing app:', error)
      await initializeDemoMode()
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [setLoading, authenticateWithTelegram, fetchUserFamilies, fetchFriends, fetchPendingRequests])

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
    
    // Set current family
    useUserStore.getState().setCurrentFamily('demo-family-id')

    // Demo friends
    setFriends([
      {
        id: 'demo-friend-1',
        telegram_id: 111111111,
        username: 'friend1',
        first_name: 'Алексей',
        last_name: 'Иванов',
        avatar_url: null,
        birthday: '1992-03-20',
        chat_id: 111111111,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        friendship_created_at: new Date().toISOString(),
      },
      {
        id: 'demo-friend-2',
        telegram_id: 222222222,
        username: 'friend2',
        first_name: 'Мария',
        last_name: 'Петрова',
        avatar_url: null,
        birthday: '1995-07-10',
        chat_id: 222222222,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        friendship_created_at: new Date().toISOString(),
      },
    ])

    return demoUser
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5fffa' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#3E000C' }} />
          <p style={{ color: '#3E000C60' }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col max-w-[450px] mx-auto" style={{ backgroundColor: '#f5fffa' }}>
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
