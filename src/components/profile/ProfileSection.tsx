'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Users,
  Home,
  Cake,
  UserPlus,
  Search,
  Crown,
  UserMinus,
  Archive,
  Package,
  Trash2,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
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
import { useUserStore, useFriendsStore, useTaskStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { User as UserType, Task, TaskCategory } from '@/lib/supabase/database.types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  user?: UserType
}

export function ProfileSection() {
  const { user, families, setUser, setFamilies } = useUserStore()
  const { friends, pendingRequests, setFriends, setPendingRequests, isFriend } = useFriendsStore()
  const { tasks, setTasks } = useTaskStore()
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSearchFriends, setShowSearchFriends] = useState(false)
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'family'>('profile')
  const [archivedTasks, setArchivedTasks] = useState<(Task & { category?: TaskCategory | null })[]>([])

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
      fetchFamilies()
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

  const fetchFamilies = async () => {
    if (!user) return

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
        .eq('user_id', user.id)

      if (!error && data) {
        const familiesList = data.map((fm: any) => fm.family)
        setFamilies(familiesList)
      }
    } catch (error) {
      console.error('Error fetching families:', error)
    }
  }

  const fetchPendingRequests = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      const { data: received } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      if (received) setPendingRequests(received as any)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  const fetchArchivedTasks = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Get user's families
      const { data: memberships } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)

      if (!memberships || memberships.length === 0) {
        setArchivedTasks([])
        return
      }

      const familyIds = memberships.map((m) => m.family_id)

      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          category:task_categories(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .in('family_id', familyIds)
        .eq('status', 'archived')
        .order('archived_at', { ascending: false })

      if (data) {
        setArchivedTasks(data as (Task & { category?: TaskCategory | null })[])
      }
    } catch (error) {
      console.error('Error fetching archived tasks:', error)
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
      await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
        })

      fetchPendingRequests()
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      await supabase
        .from('friendships')
        .insert([
          { user_id: user.id, friend_id: senderId },
          { user_id: senderId, friend_id: user.id },
        ])

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
      
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .insert({
          name: familyForm.name,
          created_by: user.id,
        })
        .select()
        .single()

      if (familyError) throw familyError

      await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
        })

      setFamilyForm({ name: '' })
      setShowCreateFamily(false)
      fetchFamilies()
    } catch (error) {
      console.error('Error creating family:', error)
    }
  }

  const handleInviteToFamily = async (userId: string) => {
    if (!selectedFamilyId) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('family_members')
        .insert({
          family_id: selectedFamilyId,
          user_id: userId,
          role: 'member',
        })

      if (!error) {
        setShowInviteMember(false)
        setSelectedFamilyId(null)
        setSearchQuery('')
        setSearchResults([])
        fetchFamilies()
      }
    } catch (error) {
      console.error('Error inviting to family:', error)
    }
  }

  const handleRemoveFromFamily = async (familyId: string, userId: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)

      fetchFamilies()
    } catch (error) {
      console.error('Error removing from family:', error)
    }
  }

  const handleRestoreTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({ status: 'active' })
        .eq('id', taskId)

      setArchivedTasks(archivedTasks.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Error restoring task:', error)
    }
  }

  const handleDeleteTaskPermanently = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', taskId)

      setArchivedTasks(archivedTasks.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const openInviteDialog = (familyId: string) => {
    setSelectedFamilyId(familyId)
    setShowInviteMember(true)
    setSearchQuery('')
    setSearchResults([])
  }

  const openArchiveDialog = () => {
    setShowArchive(true)
    fetchArchivedTasks()
  }

  // Check if user is already in family
  const isUserInFamily = (userId: string, familyId: string) => {
    const family = families.find(f => f.id === familyId)
    return family?.members?.some((m: any) => m.user_id === userId)
  }

  // Count completed tasks today
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completed_at) return false
    const completedDate = new Date(t.completed_at)
    const today = new Date()
    return completedDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="px-4 py-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-[#F8F5F5] rounded-full p-1 w-full">
            <TabsTrigger 
              value="profile" 
              className="rounded-full flex-1 data-[state=active]:bg-burgundy data-[state=active]:text-white transition-all duration-200"
            >
              <User className="w-4 h-4 mr-1" />
              Профиль
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="rounded-full flex-1 data-[state=active]:bg-burgundy data-[state=active]:text-white transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-1" />
              Друзья
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="family" 
              className="rounded-full flex-1 data-[state=active]:bg-burgundy data-[state=active]:text-white transition-all duration-200"
            >
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
                <p className="text-2xl font-bold text-burgundy">{completedToday}</p>
                <p className="text-xs text-[#8E8E93]">Сегодня</p>
              </div>
            </div>

            {/* Archive button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={openArchiveDialog}
            >
              <Archive className="w-4 h-4 mr-2" />
              Архив задач
              {archivedTasks.length > 0 && (
                <Badge className="ml-2 bg-burgundy/10 text-burgundy">
                  {archivedTasks.length}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="p-4 space-y-4">
            {/* Search button */}
            <Button
              className="w-full bg-burgundy hover:bg-burgundy-light"
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
                    className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
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
                        ✕
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
                    className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
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
              className="w-full bg-burgundy hover:bg-burgundy-light"
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
              families.map((family) => {
                const isUserAdmin = family.members?.find(
                  (m: any) => m.user_id === user?.id && m.role === 'admin'
                )

                return (
                  <div
                    key={family.id}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-[#1C1C1E]">{family.name}</h3>
                      <Badge className="bg-burgundy/10 text-burgundy">
                        {family.members?.length || 0} участников
                      </Badge>
                    </div>
                    
                    {/* Members list */}
                    <div className="space-y-2 mb-3">
                      {family.members?.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#F8F5F5]"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.user?.avatar_url || undefined} />
                            <AvatarFallback className="bg-burgundy text-white text-xs">
                              {member.user?.first_name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#1C1C1E]">
                              {member.user?.first_name} {member.user?.last_name}
                            </p>
                          </div>
                          {member.role === 'admin' && (
                            <Crown className="w-4 h-4 text-burgundy" />
                          )}
                          {isUserAdmin && member.user_id !== user?.id && (
                            <button
                              onClick={() => handleRemoveFromFamily(family.id, member.user_id)}
                              className="p-1 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <UserMinus className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Invite button */}
                    {isUserAdmin && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => openInviteDialog(family.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Пригласить участника
                      </Button>
                    )}
                  </div>
                )
              })
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
                      className="bg-burgundy hover:bg-burgundy-light"
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

      {/* Invite to family dialog */}
      <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Пригласить в семью</DialogTitle>
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
            
            {friends.length > 0 && !searchQuery && (
              <div className="space-y-2">
                <p className="text-xs text-[#8E8E93] font-medium">Ваши друзья:</p>
                {friends.slice(0, 5).map((friend) => (
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
                      <p className="font-medium text-[#1C1C1E]">{friend.first_name}</p>
                      <p className="text-xs text-[#8E8E93]">@{friend.username}</p>
                    </div>
                    {selectedFamilyId && isUserInFamily(friend.id, selectedFamilyId) ? (
                      <Badge className="bg-green-100 text-green-600">В семье</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-burgundy hover:bg-burgundy-light"
                        onClick={() => handleInviteToFamily(friend.id)}
                      >
                        Пригласить
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.length === 0 && (
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
                    {selectedFamilyId && isUserInFamily(result.id, selectedFamilyId) ? (
                      <Badge className="bg-green-100 text-green-600">В семье</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-burgundy hover:bg-burgundy-light"
                        onClick={() => handleInviteToFamily(result.id)}
                      >
                        Пригласить
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive dialog */}
      <Dialog open={showArchive} onOpenChange={setShowArchive}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-burgundy flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Архив задач
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {archivedTasks.length === 0 ? (
              <EmptyState
                icon={Archive}
                title="Архив пуст"
                description="Выполненные и архивированные задачи появятся здесь"
              />
            ) : (
              archivedTasks.map((task) => {
                const Icon = task.category?.icon 
                  ? (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[task.category.icon]
                  : Package
                
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-[#F8F5F5] rounded-xl p-3 transition-all hover:bg-[#F0E8E8]"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      {Icon ? <Icon className="w-5 h-5 text-burgundy" /> : <Package className="w-5 h-5 text-burgundy" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#1C1C1E] truncate">{task.title}</p>
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.category && (
                          <span className="text-xs text-burgundy/70">{task.category.name}</span>
                        )}
                        {task.completed_at && (
                          <span className="text-xs text-[#8E8E93]">
                            {format(new Date(task.completed_at), 'd MMM', { locale: ru })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full hover:bg-white"
                        onClick={() => handleRestoreTask(task.id)}
                        title="Восстановить"
                      >
                        <RotateCcw className="w-4 h-4 text-[#8E8E93]" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full hover:bg-red-50"
                        onClick={() => handleDeleteTaskPermanently(task.id)}
                        title="Удалить навсегда"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
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
