'use client'

import { useState, useEffect } from 'react'
import { Gift, Plus, Heart, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { WishlistCard } from './WishlistCard'
import { useWishlistStore, useUserStore, useFriendsStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { WishlistItem } from '@/lib/supabase/database.types'

export function WishlistSection() {
  const { 
    myWishlist, 
    setMyWishlist, 
    addWishlistItem, 
    updateWishlistItem, 
    removeWishlistItem 
  } = useWishlistStore()
  const { user } = useUserStore()
  const { friends } = useFriendsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [viewMode, setViewMode] = useState<'own' | 'friend'>('own')
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [friendWishlist, setFriendWishlist] = useState<WishlistItem[]>([])
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    price: '',
  })

  // Fetch user's wishlist when user is ready (friends are loaded globally in page.tsx)
  useEffect(() => {
    if (user) {
      fetchMyWishlist()
    }
  }, [user])

  // Realtime subscription for own wishlist
  useEffect(() => {
    if (!user || viewMode !== 'own') return

    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel(`wishlist-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const eventType = payload.eventType
          const newData = payload.new as any
          const oldData = payload.old as any

          if (eventType === 'INSERT') {
            if (!myWishlist.some(item => item.id === newData.id)) {
              addWishlistItem(newData as WishlistItem)
            }
          } else if (eventType === 'UPDATE') {
            updateWishlistItem(newData.id, newData as WishlistItem)
          } else if (eventType === 'DELETE') {
            removeWishlistItem(oldData.id)
          }
        }
      )
      .subscribe((status) => {
        console.log('Wishlist realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, viewMode, myWishlist, addWishlistItem, updateWishlistItem, removeWishlistItem])

  // Realtime for friend's wishlist when viewing
  useEffect(() => {
    if (!selectedFriendId || viewMode !== 'friend') return

    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel(`wishlist-friend-${selectedFriendId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${selectedFriendId}`,
        },
        async (payload) => {
          const eventType = payload.eventType
          const newData = payload.new as any
          const oldData = payload.old as any

          if (eventType === 'INSERT') {
            if (!friendWishlist.some(item => item.id === newData.id)) {
              setFriendWishlist(prev => [newData as WishlistItem, ...prev])
            }
          } else if (eventType === 'UPDATE') {
            setFriendWishlist(prev => 
              prev.map(item => item.id === newData.id ? (newData as WishlistItem) : item)
            )
          } else if (eventType === 'DELETE') {
            setFriendWishlist(prev => prev.filter(item => item.id !== oldData.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedFriendId, viewMode, friendWishlist])

  const fetchMyWishlist = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMyWishlist(data)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFriendWishlist = async (friendId: string) => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', friendId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setFriendWishlist(data)
      }
    } catch (error) {
      console.error('Error fetching friend wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateItem = async () => {
    if (!user || !formData.title) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          link: formData.link || null,
          price: formData.price ? parseFloat(formData.price) : null,
        })
        .select()
        .single()

      if (!error && data) {
        // Realtime will handle this, but add locally for instant feedback
        if (!myWishlist.some(item => item.id === data.id)) {
          addWishlistItem(data)
        }
        resetForm()
        setShowItemForm(false)
      }
    } catch (error) {
      console.error('Error creating wishlist item:', error)
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !formData.title) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlist_items')
        .update({
          title: formData.title,
          description: formData.description || null,
          link: formData.link || null,
          price: formData.price ? parseFloat(formData.price) : null,
        })
        .eq('id', editingItem.id)
        .select()
        .single()

      if (!error && data) {
        updateWishlistItem(editingItem.id, data)
        resetForm()
        setEditingItem(null)
        setShowItemForm(false)
      }
    } catch (error) {
      console.error('Error updating wishlist item:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      price: '',
    })
  }

  const handleEditItem = (item: WishlistItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      link: item.link || '',
      price: item.price ? item.price.toString() : '',
    })
    setShowItemForm(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)

      if (!error) {
        removeWishlistItem(itemId)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleBook = async (itemId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          is_booked: true,
          booked_by: user.id,
        })
        .eq('id', itemId)

      if (!error) {
        if (viewMode === 'own') {
          updateWishlistItem(itemId, { is_booked: true, booked_by: user.id } as WishlistItem)
        } else {
          setFriendWishlist(
            friendWishlist.map((i) =>
              i.id === itemId ? { ...i, is_booked: true, booked_by: user.id } : i
            )
          )
        }
      }
    } catch (error) {
      console.error('Error booking item:', error)
    }
  }

  const handleUnbook = async (itemId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          is_booked: false,
          booked_by: null,
        })
        .eq('id', itemId)
        .eq('booked_by', user.id)

      if (!error) {
        if (viewMode === 'own') {
          updateWishlistItem(itemId, { is_booked: false, booked_by: null } as WishlistItem)
        } else {
          setFriendWishlist(
            friendWishlist.map((i) =>
              i.id === itemId ? { ...i, is_booked: false, booked_by: null } : i
            )
          )
        }
      }
    } catch (error) {
      console.error('Error unbooking item:', error)
    }
  }

  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId)
    setViewMode('friend')
    fetchFriendWishlist(friendId)
  }

  const handleCloseForm = () => {
    resetForm()
    setEditingItem(null)
    setShowItemForm(false)
  }

  const displayItems = viewMode === 'own' ? myWishlist : friendWishlist

  return (
    <>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* View mode switcher */}
        <div className="px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'own' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('own')}
              className={viewMode === 'own' ? 'bg-burgundy hover:bg-burgundy-light rounded-full' : 'rounded-full'}
            >
              <Heart className="w-4 h-4 mr-1" />
              Мой Wishlist
            </Button>
            {friends.length > 0 && (
              <Button
                variant={viewMode === 'friend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('friend')}
                className={viewMode === 'friend' ? 'bg-burgundy hover:bg-burgundy-light rounded-full' : 'rounded-full'}
              >
                <Gift className="w-4 h-4 mr-1" />
                Друзья
              </Button>
            )}
          </div>
        </div>

        {/* Friend selector */}
        {viewMode === 'friend' && (
          <div className="px-4 py-3 border-b border-[#F0E8E8] overflow-x-auto">
            <div className="flex gap-2">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all',
                    selectedFriendId === friend.id
                      ? 'text-white bg-burgundy'
                      : 'bg-[#F8F5F5] hover:bg-[#F0E8E8]'
                  )}
                >
                  <span>{friend.first_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist items */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">
          {!selectedFriendId && viewMode === 'friend' ? (
            <EmptyState
              icon={Gift}
              title="Выберите друга"
              description="Посмотрите Wishlist друга, чтобы выбрать подарок"
            />
          ) : displayItems.length === 0 ? (
            <EmptyState
              icon={Gift}
              title={viewMode === 'own' ? 'Wishlist пуст' : 'Wishlist пуст'}
              description={
                viewMode === 'own'
                  ? 'Добавьте желаемые подарки'
                  : 'У друга пока нет желаний в Wishlist'
              }
            />
          ) : (
            displayItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                isOwner={viewMode === 'own'}
                currentUserId={user?.id}
                onBook={handleBook}
                onUnbook={handleUnbook}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
              />
            ))
          )}
        </div>

        {/* Floating action button (only for own wishlist) */}
        {viewMode === 'own' && (
          <button
            onClick={() => setShowItemForm(true)}
            className="fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-burgundy"
            style={{
              boxShadow: '0 4px 20px rgba(139, 30, 63, 0.3)'
            }}
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Full screen form */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#F0E8E8]">
            <button
              onClick={handleCloseForm}
              className="p-2 -ml-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#1C1C1E]" />
            </button>
            
            <h1 className="text-lg font-semibold text-[#1C1C1E]">
              {editingItem ? 'Редактировать' : 'Добавить желание'}
            </h1>
            
            <button
              onClick={handleCloseForm}
              className="p-2 -mr-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
            >
              <X className="w-6 h-6 text-[#1C1C1E]" />
            </button>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Название</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Что бы вы хотели?"
                className="border-[#F0E8E8] focus:border-burgundy"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Цена (₽)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Примерная стоимость"
                className="border-[#F0E8E8] focus:border-burgundy"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Описание</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Размер, цвет, детали..."
                rows={2}
                className="border-[#F0E8E8] focus:border-burgundy resize-none"
              />
            </div>

            {/* Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Ссылка</label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="border-[#F0E8E8] focus:border-burgundy"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="p-4 border-t border-[#F0E8E8]">
            <Button
              onClick={editingItem ? handleUpdateItem : handleCreateItem}
              disabled={!formData.title}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white"
            >
              {editingItem ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
