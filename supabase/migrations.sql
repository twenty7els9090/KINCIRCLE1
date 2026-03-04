-- KINCIRCLE Database Schema
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE family_member_role AS ENUM ('admin', 'member');
CREATE TYPE task_type AS ENUM ('shopping', 'home', 'other');
CREATE TYPE task_status AS ENUM ('active', 'completed', 'archived', 'deleted');
CREATE TYPE event_response AS ENUM ('pending', 'going', 'not_going');

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  birthday DATE,
  chat_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friend_request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- 3. Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- 4. Family groups table
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_groups_created_by ON family_groups(created_by);

-- 5. Family members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role family_member_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);

-- 6. Task categories table (fixed reference)
CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  image_url TEXT,
  type task_type NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_task_categories_type ON task_categories(type);

-- 7. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type task_type NOT NULL,
  category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC,
  unit TEXT,
  assigned_to UUID[],
  status task_status DEFAULT 'active',
  image_url TEXT,
  price NUMERIC,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_family ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);

-- 8. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  invited_users UUID[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- 9. Event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response event_response DEFAULT 'pending',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- 10. Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  price NUMERIC,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_booked ON wishlist_items(is_booked);

-- 11. Wishlist bookings history table
CREATE TABLE IF NOT EXISTS wishlist_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wishlist_bookings_item ON wishlist_bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_bookings_user ON wishlist_bookings(user_id);

-- 12. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert default task categories
INSERT INTO task_categories (name, icon, type, "order") VALUES
  -- Shopping categories
  ('Молочное', 'Milk', 'shopping', 1),
  ('Мясо и рыба', 'Beef', 'shopping', 2),
  ('Бакалея', 'Package', 'shopping', 3),
  ('Овощи и фрукты', 'Apple', 'shopping', 4),
  ('Напитки', 'Coffee', 'shopping', 5),
  ('Хлеб и выпечка', 'Croissant', 'shopping', 6),
  ('Сладости', 'Candy', 'shopping', 7),
  ('Маркетплейсы', 'ShoppingBag', 'shopping', 8),
  ('Аптека', 'Pill', 'shopping', 9),
  ('Бытовая химия', 'SprayCan', 'shopping', 10),
  -- Home categories
  ('Уборка', 'Sparkles', 'home', 11),
  ('Стирка', 'Shirt', 'home', 12),
  ('Ремонт', 'Hammer', 'home', 13),
  ('Сад', 'Flower2', 'home', 14),
  ('Готовка', 'ChefHat', 'home', 15),
  -- Other
  ('Другое', 'MoreHorizontal', 'other', 16)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- Allow viewing all users for friends search

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true); -- Controlled by app logic

CREATE POLICY "Allow insert for new users" ON users
  FOR INSERT WITH CHECK (true);

-- RLS Policies for task_categories (read-only for all)
CREATE POLICY "Anyone can read categories" ON task_categories
  FOR SELECT USING (true);

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON friendships
  FOR SELECT USING (true); -- Controlled by app

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete friendships" ON friendships
  FOR DELETE USING (true);

-- RLS Policies for friend_requests
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update friend requests" ON friend_requests
  FOR UPDATE USING (true);

-- RLS Policies for family_groups
CREATE POLICY "Users can view their families" ON family_groups
  FOR SELECT USING (true);

CREATE POLICY "Users can create families" ON family_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update families" ON family_groups
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete families" ON family_groups
  FOR DELETE USING (true);

-- RLS Policies for family_members
CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join families" ON family_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update family membership" ON family_members
  FOR UPDATE USING (true);

CREATE POLICY "Users can leave families" ON family_members
  FOR DELETE USING (true);

-- RLS Policies for tasks
CREATE POLICY "Family members can view tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Family members can create tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Family members can update tasks" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Family members can delete tasks" ON tasks
  FOR DELETE USING (true);

-- RLS Policies for events
CREATE POLICY "Users can view their events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete events" ON events
  FOR DELETE USING (true);

-- RLS Policies for event_participants
CREATE POLICY "Users can view event participants" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update participation" ON event_participants
  FOR UPDATE USING (true);

-- RLS Policies for wishlist_items
CREATE POLICY "Users can view wishlists" ON wishlist_items
  FOR SELECT USING (true);

CREATE POLICY "Users can create wishlist items" ON wishlist_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update wishlist items" ON wishlist_items
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete wishlist items" ON wishlist_items
  FOR DELETE USING (true);

-- RLS Policies for wishlist_bookings
CREATE POLICY "Users can view bookings" ON wishlist_bookings
  FOR SELECT USING (true);

CREATE POLICY "Users can create bookings" ON wishlist_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bookings" ON wishlist_bookings
  FOR UPDATE USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (true);

-- Enable Realtime for specific tables
-- Run these in Supabase Dashboard > Database > Replication
-- or use the following commands:

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;

-- Storage buckets (run in Supabase Dashboard > Storage)
-- Create buckets:
-- 1. task-images (public)
-- 2. category-images (public)
-- 3. event-images (public)
-- 4. avatar-images (public)

-- Storage policies for task-images bucket
-- INSERT POLICY: Allow authenticated users to upload
-- SELECT POLICY: Allow public access to read
-- UPDATE POLICY: Allow users to update their uploads
-- DELETE POLICY: Allow users to delete their uploads
