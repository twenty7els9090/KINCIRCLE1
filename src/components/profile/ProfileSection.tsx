'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Users,
  Home,
  Calendar,
  Settings,
  LogOut,
  Edit2,
  Cake,
  UserPlus,
  Search,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { useUserStore, useFriendsStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { User as UserType } from '@/lib/supabase/database.types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function ProfileSection() {
  const { user, families, setUser } = useUserStore()
  const { friends, pendingRequests, sentRequests, setFriends, setPendingRequests, setSentRequests, addFriend, removeFriend, isFriend } = useFriendsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSearchFriends, setShowSearchFriends] = useState(false)
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'family'>('profile')

  // Edit profile form
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    birthday: '',
  })

  // Create family form
  const [familyForm, setFamilyForm] = useState({
    name: '',
  })

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchFriends()
      fetchPendingRequests()
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        birthday: user.birthday || '',
      })
    }
  }, [user])

  const fetchFriends = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          created_at,
          friend:users!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)

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
  }

  const fetchPendingRequests = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Received requests
      const { data: received } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      // Sent requests
      const { data: sent } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending')

      if (received) setPendingRequests(received as any)
      if (sent) setSentRequests(sent as any)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim() || !user) {
      setSearchResults([])
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10)

      if (!error && data) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
        })

      if (!error) {
        // Refresh sent requests
        fetchPendingRequests()
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Update request status
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      // Create friendships
      await supabase
        .from('friendships')
        .insert([
          { user_id: user.id, friend_id: senderId },
          { user_id: senderId, friend_id: user.id },
        ])

      // Refresh data
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error('Error accepting friend request:', error)
    }
  }

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId)

      fetchPendingRequests()
    } catch (error) {
      console.error('Error declining friend request:', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileForm.first_name || null,
          last_name: profileForm.last_name || null,
          birthday: profileForm.birthday || null,
        })
        .eq('id', user.id)

      if (!error) {
        setUser({
          ...user,
          first_name: profileForm.first_name || null,
          last_name: profileForm.last_name || null,
          birthday: profileForm.birthday || null,
        })
        setShowEditProfile(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCreateFamily = async () => {
    if (!user || !familyForm.name) return

    try {
      const supabase = getSupabaseClient()
      
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .insert({
          name: familyForm.name,
          created_by: user.id,
        })
        .select()
        .single()

      if (familyError) throw familyError

      // Add user as admin
      await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
        })

      // Reset and refresh
      setFamilyForm({ name: '' })
      setShowCreateFamily(false)
      // Refresh families
    } catch (error) {
      console.error('Error creating family:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="px-4 py-3 border-b border-[#F0E8E8]">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-[#F8F5F5]">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              <User className="w-4 h-4 mr-1" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              <Users className="w-4 h-4 mr-1" />
              Друзья
              {pendingRequests.length > 0 && (
                <Badge className="ml-1 h-5 min-w-5 bg-burgundy text-white">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="family" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              <Home className="w-4 h-4 mr-1" />
              Семья
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            {/* User info card */}
            <div className="flex flex-col items-center py-4">
              <Avatar className="w-24 h-24 border-4 border-burgundy/20">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="bg-burgundy text-white text-2xl font-medium">
                  {user?.first_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-[#1C1C1E] mt-3">
                {user?.first_name} {user?.last_name}
              </h2>
              {user?.username && (
                <p className="text-sm text-[#8E8E93]">@{user.username}</p>
              )}
              {user?.birthday && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-[#8E8E93]">
                  <Cake className="w-4 h-4 text-burgundy" />
                  <span>
                    {format(new Date(user.birthday), 'd MMMM', { locale: ru })}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Редактировать профиль
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8F5F5] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-burgundy">{friends.length}</p>
                <p className="text-xs text-[#8E8E93]">Друзей</p>
              </div>
              <div className="bg-[#F8F5F5] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-burgundy">{families.length}</p>
                <p className="text-xs text-[#8E8E93]">Семей</p>
              </div>
              <div className="bg-[#F8F5F5] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-burgundy">0</p>
                <p className="text-xs text-[#8E8E93]">Событий</p>
              </div>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="p-4 space-y-4">
            {/* Search button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSearchFriends(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Найти друзей
            </Button>

            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#8E8E93]">
                  Запросы в друзья ({pendingRequests.length})
                </h3>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 bg-[#F8F5F5] rounded-xl p-3"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.sender?.avatar_url || undefined} />
                      <AvatarFallback className="bg-burgundy text-white">
                        {request.sender?.first_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-[#1C1C1E]">
                        {request.sender?.first_name}
                      </p>
                      <p className="text-xs text-[#8E8E93]">
                        @{request.sender?.username}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-burgundy hover:bg-burgundy-light"
                        onClick={() => handleAcceptFriendRequest(request.id, request.sender_id)}
                      >
                        Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineFriendRequest(request.id)}
                      >
                        Отклонить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends list */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#8E8E93]">
                Мои друзья ({friends.length})
              </h3>
              {friends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Нет друзей"
                  description="Найдите друзей по username"
                />
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 bg-[#F8F5F5] rounded-xl p-3"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback className="bg-burgundy text-white">
                        {friend.first_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-[#1C1C1E]">
                        {friend.first_name} {friend.last_name}
                      </p>
                      {friend.birthday && (
                        <p className="text-xs text-[#8E8E93]">
                          🎂 {format(new Date(friend.birthday), 'd MMM', { locale: ru })}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <div className="p-4 space-y-4">
            {/* Create family button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateFamily(true)}
            >
              <Home className="w-4 h-4 mr-2" />
              Создать семью
            </Button>

            {/* Families list */}
            {families.length === 0 ? (
              <EmptyState
                icon={Home}
                title="Нет семьи"
                description="Создайте семейную группу для совместного ведения задач"
              />
            ) : (
              families.map((family) => (
                <div
                  key={family.id}
                  className="bg-[#F8F5F5] rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#1C1C1E]">{family.name}</h3>
                    <Badge className="bg-burgundy/10 text-burgundy">
                      {family.members?.length || 0} участников
                    </Badge>
                  </div>
                  
                  {/* Members */}
                  <div className="flex -space-x-2">
                    {family.members?.slice(0, 6).map((member: any) => (
                      <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                        <AvatarImage src={member.user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-burgundy text-white text-xs">
                          {member.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(family.members?.length || 0) > 6 && (
                      <div className="w-8 h-8 rounded-full bg-[#F0E8E8] flex items-center justify-center text-xs text-[#8E8E93] border-2 border-white">
                        +{(family.members?.length || 0) - 6}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit profile dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Редактировать профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Фамилия</Label>
              <Input
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Дата рождения</Label>
              <Input
                type="date"
                value={profileForm.birthday}
                onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Отмена
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy-light"
              onClick={handleUpdateProfile}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search friends dialog */}
      <Dialog open={showSearchFriends} onOpenChange={setShowSearchFriends}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Найти друзей</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
              <Input
                className="pl-9"
                placeholder="Поиск по username..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
              />
            </div>
            
            {/* Search results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.length === 0 && searchQuery && (
                <p className="text-sm text-[#8E8E93] text-center py-4">
                  Пользователи не найдены
                </p>
              )}
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 bg-[#F8F5F5] rounded-xl p-3"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={result.avatar_url || undefined} />
                    <AvatarFallback className="bg-burgundy text-white">
                      {result.first_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-[#1C1C1E]">{result.first_name}</p>
                    <p className="text-xs text-[#8E8E93]">@{result.username}</p>
                  </div>
                  {!isFriend(result.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendFriendRequest(result.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Добавить
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create family dialog */}
      <Dialog open={showCreateFamily} onOpenChange={setShowCreateFamily}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Создать семью</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название семьи</Label>
              <Input
                placeholder="Например: Ивановы"
                value={familyForm.name}
                onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFamily(false)}>
              Отмена
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy-light"
              onClick={handleCreateFamily}
              disabled={!familyForm.name}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
