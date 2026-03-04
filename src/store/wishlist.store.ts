import { create } from 'zustand'
import type { WishlistItem, WishlistItemInsert, WishlistItemUpdate, User } from '@/lib/supabase/database.types'

interface WishlistItemWithOwner extends WishlistItem {
  owner: User
}

interface WishlistState {
  // Own wishlist
  myWishlist: WishlistItem[]
  
  // Others' wishlists (viewed)
  viewedWishlist: WishlistItemWithOwner[]
  viewedUserId: string | null
  
  // Loading states
  isLoading: boolean
  
  // Actions - Own wishlist
  setMyWishlist: (items: WishlistItem[]) => void
  addWishlistItem: (item: WishlistItem) => void
  updateWishlistItem: (itemId: string, updates: WishlistItemUpdate) => void
  removeWishlistItem: (itemId: string) => void
  
  // Actions - View wishlist
  setViewedWishlist: (items: WishlistItemWithOwner[], userId: string) => void
  clearViewedWishlist: () => void
  
  // Booking actions
  bookItem: (itemId: string, userId: string) => void
  unbookItem: (itemId: string) => void
  
  setLoading: (loading: boolean) => void
  
  // Computed helpers
  getBookedItems: () => WishlistItem[]
  getUnbookedItems: () => WishlistItem[]
  getWishlistItemById: (itemId: string) => WishlistItem | undefined
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  myWishlist: [],
  viewedWishlist: [],
  viewedUserId: null,
  isLoading: false,

  setMyWishlist: (items) => set({ myWishlist: items }),
  
  addWishlistItem: (item) =>
    set((state) => ({
      myWishlist: [item, ...state.myWishlist],
    })),
    
  updateWishlistItem: (itemId, updates) =>
    set((state) => ({
      myWishlist: state.myWishlist.map((i) =>
        i.id === itemId ? { ...i, ...updates } : i
      ),
    })),
    
  removeWishlistItem: (itemId) =>
    set((state) => ({
      myWishlist: state.myWishlist.filter((i) => i.id !== itemId),
    })),

  setViewedWishlist: (items, userId) =>
    set({ viewedWishlist: items, viewedUserId: userId }),
    
  clearViewedWishlist: () =>
    set({ viewedWishlist: [], viewedUserId: null }),

  bookItem: (itemId, userId) =>
    set((state) => ({
      myWishlist: state.myWishlist.map((i) =>
        i.id === itemId ? { ...i, is_booked: true, booked_by: userId } : i
      ),
      viewedWishlist: state.viewedWishlist.map((i) =>
        i.id === itemId ? { ...i, is_booked: true, booked_by: userId } : i
      ),
    })),

  unbookItem: (itemId) =>
    set((state) => ({
      myWishlist: state.myWishlist.map((i) =>
        i.id === itemId ? { ...i, is_booked: false, booked_by: null } : i
      ),
      viewedWishlist: state.viewedWishlist.map((i) =>
        i.id === itemId ? { ...i, is_booked: false, booked_by: null } : i
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  getBookedItems: () => {
    const { myWishlist } = get()
    return myWishlist.filter((i) => i.is_booked)
  },

  getUnbookedItems: () => {
    const { myWishlist } = get()
    return myWishlist.filter((i) => !i.is_booked)
  },

  getWishlistItemById: (itemId) => {
    const { myWishlist } = get()
    return myWishlist.find((i) => i.id === itemId)
  },
}))
