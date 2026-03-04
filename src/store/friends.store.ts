import { create } from 'zustand'
import type { User, FriendRequest, Friendship } from '@/lib/supabase/database.types'

interface FriendWithDetails extends User {
  friendship_created_at: string
}

interface FriendRequestWithUser extends FriendRequest {
  sender: User
  receiver: User
}

interface FriendsState {
  // Friends data
  friends: FriendWithDetails[]
  pendingRequests: FriendRequestWithUser[]
  sentRequests: FriendRequestWithUser[]
  
  // Search
  searchQuery: string
  searchResults: User[]
  isSearching: boolean
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setFriends: (friends: FriendWithDetails[]) => void
  addFriend: (friend: FriendWithDetails) => void
  removeFriend: (friendId: string) => void
  
  setPendingRequests: (requests: FriendRequestWithUser[]) => void
  addPendingRequest: (request: FriendRequestWithUser) => void
  removePendingRequest: (requestId: string) => void
  
  setSentRequests: (requests: FriendRequestWithUser[]) => void
  addSentRequest: (request: FriendRequestWithUser) => void
  removeSentRequest: (receiverId: string) => void
  
  setSearchQuery: (query: string) => void
  setSearchResults: (results: User[]) => void
  setIsSearching: (searching: boolean) => void
  
  setLoading: (loading: boolean) => void
  
  // Computed helpers
  isFriend: (userId: string) => boolean
  hasPendingRequestFrom: (userId: string) => boolean
  hasSentRequestTo: (userId: string) => boolean
  getFriendById: (friendId: string) => FriendWithDetails | undefined
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isLoading: false,

  setFriends: (friends) => set({ friends }),
  
  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
    })),
    
  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== friendId),
    })),

  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request],
    })),
    
  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    })),

  setSentRequests: (requests) => set({ sentRequests: requests }),
  
  addSentRequest: (request) =>
    set((state) => ({
      sentRequests: [...state.sentRequests, request],
    })),
    
  removeSentRequest: (receiverId) =>
    set((state) => ({
      sentRequests: state.sentRequests.filter((r) => r.receiver_id !== receiverId),
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setLoading: (loading) => set({ isLoading: loading }),

  isFriend: (userId) => {
    const { friends } = get()
    return friends.some((f) => f.id === userId)
  },

  hasPendingRequestFrom: (userId) => {
    const { pendingRequests } = get()
    return pendingRequests.some((r) => r.sender_id === userId)
  },

  hasSentRequestTo: (userId) => {
    const { sentRequests } = get()
    return sentRequests.some((r) => r.receiver_id === userId)
  },

  getFriendById: (friendId) => {
    const { friends } = get()
    return friends.find((f) => f.id === friendId)
  },
}))
