/**
 * User Store - Manages user authentication and profile state
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, FamilyGroup } from '@/lib/supabase/types';

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Current family context
  currentFamily: FamilyGroup | null;
  families: FamilyGroup[];
  
  // Friends
  friends: User[];
  pendingFriendRequests: { id: string; sender: User }[];
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentFamily: (family: FamilyGroup | null) => void;
  setFamilies: (families: FamilyGroup[]) => void;
  setFriends: (friends: User[]) => void;
  setPendingFriendRequests: (requests: { id: string; sender: User }[]) => void;
  addFriend: (friend: User) => void;
  removeFriend: (friendId: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentFamily: null,
      families: [],
      friends: [],
      pendingFriendRequests: [],

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setCurrentFamily: (family) =>
        set({ currentFamily: family }),

      setFamilies: (families) =>
        set({ families }),

      setFriends: (friends) =>
        set({ friends }),

      setPendingFriendRequests: (requests) =>
        set({ pendingFriendRequests: requests }),

      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),

      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentFamily: null,
          families: [],
          friends: [],
          pendingFriendRequests: [],
        }),
    }),
    {
      name: 'kincircle-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentFamily: state.currentFamily,
      }),
    }
  )
);
