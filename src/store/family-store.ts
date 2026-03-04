/**
 * Family Store - Manages family group state and members
 */
import { create } from 'zustand';
import type { FamilyGroup, FamilyMember, User } from '@/lib/supabase/types';

interface FamilyMemberWithUser extends FamilyMember {
  user: User;
}

interface FamilyState {
  // Current family
  currentFamilyId: string | null;
  currentFamily: FamilyGroup | null;
  members: FamilyMemberWithUser[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentFamily: (family: FamilyGroup | null) => void;
  setMembers: (members: FamilyMemberWithUser[]) => void;
  addMember: (member: FamilyMemberWithUser) => void;
  removeMember: (userId: string) => void;
  updateMemberRole: (userId: string, role: 'admin' | 'member') => void;
  setLoading: (loading: boolean) => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyState>()((set) => ({
  currentFamilyId: null,
  currentFamily: null,
  members: [],
  isLoading: false,

  setCurrentFamily: (family) =>
    set({
      currentFamily: family,
      currentFamilyId: family?.id || null,
    }),

  setMembers: (members) =>
    set({ members }),

  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => m.user_id !== userId),
    })),

  updateMemberRole: (userId, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.user_id === userId ? { ...m, role } : m
      ),
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearFamily: () =>
    set({
      currentFamilyId: null,
      currentFamily: null,
      members: [],
      isLoading: false,
    }),
}));
