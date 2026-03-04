import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, FamilyGroup, FamilyMember } from '@/lib/supabase/database.types'

interface UserState {
  // User data
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Family data
  families: (FamilyGroup & { members: FamilyMember[] })[]
  currentFamilyId: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setFamilies: (families: (FamilyGroup & { members: FamilyMember[] })[]) => void
  setCurrentFamily: (familyId: string | null) => void
  addFamily: (family: FamilyGroup & { members: FamilyMember[] }) => void
  updateFamily: (familyId: string, updates: Partial<FamilyGroup>) => void
  removeFamily: (familyId: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      families: [],
      currentFamilyId: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setFamilies: (families) =>
        set({ families }),

      setCurrentFamily: (familyId) =>
        set({ currentFamilyId: familyId }),

      addFamily: (family) =>
        set((state) => ({
          families: [...state.families, family],
          currentFamilyId: state.currentFamilyId || family.id,
        })),

      updateFamily: (familyId, updates) =>
        set((state) => ({
          families: state.families.map((f) =>
            f.id === familyId ? { ...f, ...updates } : f
          ),
        })),

      removeFamily: (familyId) =>
        set((state) => ({
          families: state.families.filter((f) => f.id !== familyId),
          currentFamilyId:
            state.currentFamilyId === familyId
              ? state.families[0]?.id || null
              : state.currentFamilyId,
        })),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          families: [],
          currentFamilyId: null,
        }),
    }),
    {
      name: 'kincircle-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentFamilyId: state.currentFamilyId,
      }),
    }
  )
)
