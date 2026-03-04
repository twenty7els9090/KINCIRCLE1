/**
 * UI Store - Manages app-wide UI state
 */
import { create } from 'zustand';

// Tab identifiers
export type TabId = 'tasks' | 'events' | 'wishlist' | 'profile';

// Modal types
export type ModalType = 
  | 'create-task'
  | 'edit-task'
  | 'create-event'
  | 'event-details'
  | 'create-wishlist'
  | 'friends'
  | 'family'
  | 'settings'
  | null;

interface ModalData {
  [key: string]: unknown;
}

interface UIState {
  // Tab navigation
  activeTab: TabId;
  
  // Modal state
  activeModal: ModalType;
  modalData: ModalData;
  
  // Loading states
  isGlobalLoading: boolean;
  
  // Birthday reminder
  showBirthdayReminder: boolean;
  
  // Actions
  setActiveTab: (tab: TabId) => void;
  openModal: (modal: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setShowBirthdayReminder: (show: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTab: 'tasks',
  activeModal: null,
  modalData: {},
  isGlobalLoading: false,
  showBirthdayReminder: false,

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  openModal: (modal, data = {}) =>
    set({
      activeModal: modal,
      modalData: data,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: {},
    }),

  setGlobalLoading: (loading) =>
    set({ isGlobalLoading: loading }),

  setShowBirthdayReminder: (show) =>
    set({ showBirthdayReminder: show }),
}));
