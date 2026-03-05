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
  const { myWishlist, setMyWishlist, addWishlistItem, removeWishlistItem, bookItem, unbookItem } = useWishlistStore()
  const { user } = useUserStore()
  const { friends } = useFriendsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [viewMode, setViewMode] = useState<'own' | 'friend'>('own')
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [friendWishlist, setFriendWishlist] = useState<WishlistItem[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
  })

  // Fetch user's wishlist
  useEffect(() => {
    if (user && viewMode === 'own') {
      fetchMyWishlist()
    }
  }, [user, viewMode])

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
        })
        .select()
        .single()

      if (!error && data) {
        addWishlistItem(data)
        resetForm()
        setShowItemForm(false)
      }
    } catch (error) {
      console.error('Error creating wishlist item:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
    })
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
          bookItem(itemId, user.id)
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
          unbookItem(itemId)
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
              Мой вишлист
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
              description="Посмотрите вишлист друга, чтобы выбрать подарок"
            />
          ) : displayItems.length === 0 ? (
            <EmptyState
              icon={Gift}
              title={viewMode === 'own' ? 'Вишлист пуст' : 'Вишлист пуст'}
              description={
                viewMode === 'own'
                  ? 'Добавьте желаемые подарки'
                  : 'У друга пока нет желаний в вишлисте'
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
              onClick={() => { resetForm(); setShowItemForm(false); }}
              className="p-2 -ml-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#1C1C1E]" />
            </button>
            
            <h1 className="text-lg font-semibold text-[#1C1C1E]">Добавить желание</h1>
            
            <button
              onClick={() => { resetForm(); setShowItemForm(false); }}
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
              onClick={handleCreateItem}
              disabled={!formData.title}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white"
            >
              Добавить
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
