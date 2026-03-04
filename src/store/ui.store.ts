import { create } from 'zustand'

export type TabId = 'tasks' | 'events' | 'wishlist' | 'profile'

interface ModalState {
  isOpen: boolean
  type: string | null
  data?: Record<string, unknown>
}

interface UIState {
  // Tab navigation
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  
  // Modal state
  modal: ModalState
  openModal: (type: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  
  // Loading states
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void
  
  // Realtime indicators
  typingUsers: { userId: string; userName: string; timestamp: number }[]
  addTypingUser: (userId: string, userName: string) => void
  removeTypingUser: (userId: string) => void
  clearTypingUsers: () => void
  
  // Toast/notification queue
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[]
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Tab navigation
  activeTab: 'tasks',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Modal state
  modal: { isOpen: false, type: null },
  openModal: (type, data) => set({ modal: { isOpen: true, type, data } }),
  closeModal: () => set({ modal: { isOpen: false, type: null } }),

  // Loading states
  isPageLoading: false,
  setPageLoading: (loading) => set({ isPageLoading: loading }),

  // Realtime indicators
  typingUsers: [],
  addTypingUser: (userId, userName) => {
    const current = get().typingUsers.filter(
      (t) => t.userId !== userId && t.timestamp > Date.now() - 5000
    )
    set({ typingUsers: [...current, { userId, userName, timestamp: Date.now() }] })
  },
  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((t) => t.userId !== userId),
    })),
  clearTypingUsers: () => set({ typingUsers: [] }),

  // Toast queue
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    // Auto remove after 3 seconds
    setTimeout(() => {
      get().removeToast(id)
    }, 3000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
