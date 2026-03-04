/**
 * Supabase Database Types for KINCIRCLE
 * Generated based on the database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: number;
          username: string | null;
          first_name: string;
          last_name: string | null;
          avatar_url: string | null;
          birthday: string | null;
          chat_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: number;
          username?: string | null;
          first_name: string;
          last_name?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          chat_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: number;
          username?: string | null;
          first_name?: string;
          last_name?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          chat_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          created_at?: string;
        };
      };
      family_groups: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: 'admin' | 'member';
          joined_at?: string;
        };
      };
      task_categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          image_url: string | null;
          type: 'shopping' | 'home' | 'other';
          order: number;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          image_url?: string | null;
          type?: 'shopping' | 'home' | 'other';
          order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          image_url?: string | null;
          type?: 'shopping' | 'home' | 'other';
          order?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          type: 'shopping' | 'home' | 'other';
          category_id: string | null;
          title: string;
          description: string | null;
          quantity: number | null;
          unit: string | null;
          assigned_to: string[] | null;
          status: 'active' | 'completed' | 'archived' | 'deleted';
          image_url: string | null;
          price: number | null;
          completed_by: string | null;
          completed_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          created_by: string;
          type?: 'shopping' | 'home' | 'other';
          category_id?: string | null;
          title: string;
          description?: string | null;
          quantity?: number | null;
          unit?: string | null;
          assigned_to?: string[] | null;
          status?: 'active' | 'completed' | 'archived' | 'deleted';
          image_url?: string | null;
          price?: number | null;
          completed_by?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          created_by?: string;
          type?: 'shopping' | 'home' | 'other';
          category_id?: string | null;
          title?: string;
          description?: string | null;
          quantity?: number | null;
          unit?: string | null;
          assigned_to?: string[] | null;
          status?: 'active' | 'completed' | 'archived' | 'deleted';
          image_url?: string | null;
          price?: number | null;
          completed_by?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string | null;
          location: string | null;
          event_date: string;
          invited_users: string[] | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description?: string | null;
          location?: string | null;
          event_date: string;
          invited_users?: string[] | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          event_date?: string;
          invited_users?: string[] | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          response: 'pending' | 'going' | 'not_going';
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          response?: 'pending' | 'going' | 'not_going';
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          response?: 'pending' | 'going' | 'not_going';
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          link: string | null;
          price: number | null;
          is_booked: boolean;
          booked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          link?: string | null;
          price?: number | null;
          is_booked?: boolean;
          booked_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          link?: string | null;
          price?: number | null;
          is_booked?: boolean;
          booked_by?: string | null;
          created_at?: string;
        };
      };
      wishlist_bookings: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          booked_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          booked_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          booked_at?: string;
          cancelled_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload?: Json;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          payload?: Json;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      friend_request_status: 'pending' | 'accepted' | 'declined';
      family_member_role: 'admin' | 'member';
      task_type: 'shopping' | 'home' | 'other';
      task_status: 'active' | 'completed' | 'archived' | 'deleted';
      event_response: 'pending' | 'going' | 'not_going';
    };
  };
}

// Convenience type exports
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type FriendRequest = Database['public']['Tables']['friend_requests']['Row'];
export type FriendRequestInsert = Database['public']['Tables']['friend_requests']['Insert'];

export type Friendship = Database['public']['Tables']['friendships']['Row'];
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert'];

export type FamilyGroup = Database['public']['Tables']['family_groups']['Row'];
export type FamilyGroupInsert = Database['public']['Tables']['family_groups']['Insert'];

export type FamilyMember = Database['public']['Tables']['family_members']['Row'];
export type FamilyMemberInsert = Database['public']['Tables']['family_members']['Insert'];

export type TaskCategory = Database['public']['Tables']['task_categories']['Row'];
export type TaskCategoryInsert = Database['public']['Tables']['task_categories']['Insert'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type EventParticipant = Database['public']['Tables']['event_participants']['Row'];
export type EventParticipantInsert = Database['public']['Tables']['event_participants']['Insert'];

export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];
export type WishlistItemInsert = Database['public']['Tables']['wishlist_items']['Insert'];
export type WishlistItemUpdate = Database['public']['Tables']['wishlist_items']['Update'];

export type WishlistBooking = Database['public']['Tables']['wishlist_bookings']['Row'];
export type WishlistBookingInsert = Database['public']['Tables']['wishlist_bookings']['Insert'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

// Extended types with relations
export type TaskWithDetails = Task & {
  category?: TaskCategory | null;
  creator?: User | null;
  assignees?: User[];
  completer?: User | null;
};

export type EventWithDetails = Event & {
  creator?: User | null;
  participants?: (EventParticipant & { user?: User })[];
};

export type WishlistItemWithDetails = WishlistItem & {
  booker?: User | null;
};

export type FamilyGroupWithMembers = FamilyGroup & {
  members?: (FamilyMember & { user?: User })[];
  member_count?: number;
};

export type UserWithFriends = User & {
  friends?: User[];
  friend_count?: number;
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
