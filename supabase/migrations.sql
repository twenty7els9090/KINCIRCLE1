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

-- 6. Family invitations table
CREATE TYPE family_invitation_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status family_invitation_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(family_id, invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_family_invitations_family ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_inviter ON family_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_invitee ON family_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);

-- 7. Task categories table (fixed reference)
CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  image_url TEXT,
  type task_type NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_task_categories_type ON task_categories(type);

-- 8. Tasks table
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
  is_public BOOLEAN DEFAULT TRUE,
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

-- Create task_items table for predefined products
CREATE TABLE IF NOT EXISTS task_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  unit TEXT DEFAULT 'шт',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_items_category ON task_items(category_id);

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

-- Insert predefined task items by category
-- Note: category_id will be dynamically resolved, these are placeholder references
-- Run after categories are inserted

-- Helper function to get category ID by name
CREATE OR REPLACE FUNCTION get_category_id(cat_name TEXT)
RETURNS UUID AS $$
DECLARE
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM task_categories WHERE name = cat_name LIMIT 1;
  RETURN cat_id;
END;
$$ LANGUAGE plpgsql;

-- МОЛОЧНОЕ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Молочное'), 'Молоко', 'л', 1),
  (get_category_id('Молочное'), 'Сметана', 'шт', 2),
  (get_category_id('Молочное'), 'Творог', 'шт', 3),
  (get_category_id('Молочное'), 'Кефир', 'л', 4),
  (get_category_id('Молочное'), 'Ряженка', 'л', 5),
  (get_category_id('Молочное'), 'Йогурт', 'шт', 6),
  (get_category_id('Молочное'), 'Сливки', 'шт', 7),
  (get_category_id('Молочное'), 'Сливочное масло', 'шт', 8),
  (get_category_id('Молочное'), 'Сыр', 'шт', 9),
  (get_category_id('Молочное'), 'Яйца', 'шт', 10),
  (get_category_id('Молочное'), 'Сырки', 'шт', 11),
  (get_category_id('Молочное'), 'Твороженный сыр', 'шт', 12),
  (get_category_id('Молочное'), 'Плавленный сыр', 'шт', 13)
ON CONFLICT DO NOTHING;

-- МЯСО И РЫБА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Мясо и рыба'), 'Курица', 'кг', 1),
  (get_category_id('Мясо и рыба'), 'Говядина', 'кг', 2),
  (get_category_id('Мясо и рыба'), 'Свинина', 'кг', 3),
  (get_category_id('Мясо и рыба'), 'Баранина', 'кг', 4),
  (get_category_id('Мясо и рыба'), 'Индейка', 'кг', 5),
  (get_category_id('Мясо и рыба'), 'Утка', 'кг', 6),
  (get_category_id('Мясо и рыба'), 'Фарш', 'кг', 7),
  (get_category_id('Мясо и рыба'), 'Колбаса', 'шт', 8),
  (get_category_id('Мясо и рыба'), 'Сосиски', 'шт', 9),
  (get_category_id('Мясо и рыба'), 'Сардельки', 'шт', 10),
  (get_category_id('Мясо и рыба'), 'Ветчина', 'шт', 11),
  (get_category_id('Мясо и рыба'), 'Бекон', 'шт', 12),
  (get_category_id('Мясо и рыба'), 'Рыба свежая', 'кг', 13),
  (get_category_id('Мясо и рыба'), 'Рыба замороженная', 'шт', 14),
  (get_category_id('Мясо и рыба'), 'Креветки', 'шт', 15),
  (get_category_id('Мясо и рыба'), 'Крабовое мясо', 'шт', 16),
  (get_category_id('Мясо и рыба'), 'Селедка', 'шт', 17),
  (get_category_id('Мясо и рыба'), 'Семга', 'кг', 18),
  (get_category_id('Мясо и рыба'), 'Форель', 'кг', 19)
ON CONFLICT DO NOTHING;

-- БАКАЛЕЯ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Бакалея'), 'Мука', 'кг', 1),
  (get_category_id('Бакалея'), 'Сахар', 'кг', 2),
  (get_category_id('Бакалея'), 'Соль', 'шт', 3),
  (get_category_id('Бакалея'), 'Рис', 'кг', 4),
  (get_category_id('Бакалея'), 'Гречка', 'кг', 5),
  (get_category_id('Бакалея'), 'Макароны', 'шт', 6),
  (get_category_id('Бакалея'), 'Масло подсолнечное', 'шт', 7),
  (get_category_id('Бакалея'), 'Масло оливковое', 'шт', 8),
  (get_category_id('Бакалея'), 'Масло льна', 'шт', 9),
  (get_category_id('Бакалея'), 'Уксус', 'шт', 10),
  (get_category_id('Бакалея'), 'Соевый соус', 'шт', 11),
  (get_category_id('Бакалея'), 'Майонез', 'шт', 12),
  (get_category_id('Бакалея'), 'Кетчуп', 'шт', 13),
  (get_category_id('Бакалея'), 'Горчица', 'шт', 14),
  (get_category_id('Бакалея'), 'Хрен', 'шт', 15),
  (get_category_id('Бакалея'), 'Специи', 'шт', 16),
  (get_category_id('Бакалея'), 'Перец', 'шт', 17),
  (get_category_id('Бакалея'), 'Ванилин', 'шт', 18),
  (get_category_id('Бакалея'), 'Разрыхлитель', 'шт', 19),
  (get_category_id('Бакалея'), 'Дрожжи', 'шт', 20),
  (get_category_id('Бакалея'), 'Овсянка', 'кг', 21),
  (get_category_id('Бакалея'), 'Манка', 'кг', 22),
  (get_category_id('Бакалея'), 'Пшено', 'кг', 23),
  (get_category_id('Бакалея'), 'Перловка', 'кг', 24),
  (get_category_id('Бакалея'), 'Кукурузная крупа', 'кг', 25),
  (get_category_id('Бакалея'), 'Чечевица', 'кг', 26),
  (get_category_id('Бакалея'), 'Какао', 'шт', 27),
  (get_category_id('Бакалея'), 'Фасоль', 'кг', 28),
  (get_category_id('Бакалея'), 'Кукуруза консервированная', 'шт', 29),
  (get_category_id('Бакалея'), 'Горох', 'кг', 30)
ON CONFLICT DO NOTHING;

-- ОВОЩИ И ФРУКТЫ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Овощи и фрукты'), 'Картофель', 'кг', 1),
  (get_category_id('Овощи и фрукты'), 'Лук', 'кг', 2),
  (get_category_id('Овощи и фрукты'), 'Морковь', 'кг', 3),
  (get_category_id('Овощи и фрукты'), 'Чеснок', 'шт', 4),
  (get_category_id('Овощи и фрукты'), 'Капуста', 'шт', 5),
  (get_category_id('Овощи и фрукты'), 'Свекла', 'кг', 6),
  (get_category_id('Овощи и фрукты'), 'Огурцы', 'кг', 7),
  (get_category_id('Овощи и фрукты'), 'Помидоры', 'кг', 8),
  (get_category_id('Овощи и фрукты'), 'Перец болгарский', 'кг', 9),
  (get_category_id('Овощи и фрукты'), 'Баклажаны', 'кг', 10),
  (get_category_id('Овощи и фрукты'), 'Кабачки', 'кг', 11),
  (get_category_id('Овощи и фрукты'), 'Тыква', 'кг', 12),
  (get_category_id('Овощи и фрукты'), 'Зелень', 'шт', 13),
  (get_category_id('Овощи и фрукты'), 'Салат', 'шт', 14),
  (get_category_id('Овощи и фрукты'), 'Укроп', 'шт', 15),
  (get_category_id('Овощи и фрукты'), 'Петрушка', 'шт', 16),
  (get_category_id('Овощи и фрукты'), 'Кинза', 'шт', 17),
  (get_category_id('Овощи и фрукты'), 'Базилик', 'шт', 18),
  (get_category_id('Овощи и фрукты'), 'Яблоки', 'кг', 19),
  (get_category_id('Овощи и фрукты'), 'Груши', 'кг', 20),
  (get_category_id('Овощи и фрукты'), 'Бананы', 'кг', 21),
  (get_category_id('Овощи и фрукты'), 'Апельсины', 'кг', 22),
  (get_category_id('Овощи и фрукты'), 'Лимоны', 'кг', 23),
  (get_category_id('Овощи и фрукты'), 'Мандарины', 'кг', 24),
  (get_category_id('Овощи и фрукты'), 'Грейпфрут', 'шт', 25),
  (get_category_id('Овощи и фрукты'), 'Виноград', 'кг', 26),
  (get_category_id('Овощи и фрукты'), 'Персики', 'кг', 27),
  (get_category_id('Овощи и фрукты'), 'Абрикосы', 'кг', 28),
  (get_category_id('Овощи и фрукты'), 'Сливы', 'кг', 29),
  (get_category_id('Овощи и фрукты'), 'Вишня', 'кг', 30),
  (get_category_id('Овощи и фрукты'), 'Черешня', 'кг', 31),
  (get_category_id('Овощи и фрукты'), 'Клубника', 'кг', 32),
  (get_category_id('Овощи и фрукты'), 'Малина', 'кг', 33),
  (get_category_id('Овощи и фрукты'), 'Ежевика', 'кг', 34),
  (get_category_id('Овощи и фрукты'), 'Крыжовник', 'кг', 35),
  (get_category_id('Овощи и фрукты'), 'Смородина', 'кг', 36),
  (get_category_id('Овощи и фрукты'), 'Земляника', 'кг', 37),
  (get_category_id('Овощи и фрукты'), 'Арбуз', 'шт', 38),
  (get_category_id('Овощи и фрукты'), 'Дыня', 'шт', 39),
  (get_category_id('Овощи и фрукты'), 'Киви', 'шт', 40),
  (get_category_id('Овощи и фрукты'), 'Ананас', 'шт', 41),
  (get_category_id('Овощи и фрукты'), 'Авокадо', 'шт', 42),
  (get_category_id('Овощи и фрукты'), 'Гранат', 'шт', 43),
  (get_category_id('Овощи и фрукты'), 'Хурма', 'кг', 44),
  (get_category_id('Овощи и фрукты'), 'Кукуруза', 'шт', 45)
ON CONFLICT DO NOTHING;

-- НАПИТКИ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Напитки'), 'Чай', 'шт', 1),
  (get_category_id('Напитки'), 'Кофе', 'шт', 2),
  (get_category_id('Напитки'), 'Сок', 'л', 3),
  (get_category_id('Напитки'), 'Вода минеральная', 'л', 4),
  (get_category_id('Напитки'), 'Вода питьевая', 'л', 5),
  (get_category_id('Напитки'), 'Газировка', 'л', 6),
  (get_category_id('Напитки'), 'Лимонад', 'л', 7),
  (get_category_id('Напитки'), 'Квас', 'л', 8),
  (get_category_id('Напитки'), 'Компот', 'л', 9),
  (get_category_id('Напитки'), 'Морс', 'л', 10)
ON CONFLICT DO NOTHING;

-- ХЛЕБ И ВЫПЕЧКА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Хлеб и выпечка'), 'Хлеб белый', 'шт', 1),
  (get_category_id('Хлеб и выпечка'), 'Хлеб черный', 'шт', 2),
  (get_category_id('Хлеб и выпечка'), 'Батон', 'шт', 3),
  (get_category_id('Хлеб и выпечка'), 'Багет', 'шт', 4),
  (get_category_id('Хлеб и выпечка'), 'Лаваш', 'шт', 5),
  (get_category_id('Хлеб и выпечка'), 'Булочки', 'шт', 6),
  (get_category_id('Хлеб и выпечка'), 'Круассаны', 'шт', 7),
  (get_category_id('Хлеб и выпечка'), 'Пирожки', 'шт', 8),
  (get_category_id('Хлеб и выпечка'), 'Сушки', 'шт', 9),
  (get_category_id('Хлеб и выпечка'), 'Пряники', 'шт', 10),
  (get_category_id('Хлеб и выпечка'), 'Сухари', 'шт', 11)
ON CONFLICT DO NOTHING;

-- СЛАДОСТИ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Сладости'), 'Шоколад', 'шт', 1),
  (get_category_id('Сладости'), 'Конфеты', 'кг', 2),
  (get_category_id('Сладости'), 'Печенье', 'шт', 3),
  (get_category_id('Сладости'), 'Торт', 'шт', 4),
  (get_category_id('Сладости'), 'Пирожное', 'шт', 5),
  (get_category_id('Сладости'), 'Мороженое', 'шт', 6),
  (get_category_id('Сладости'), 'Вафли', 'шт', 7),
  (get_category_id('Сладости'), 'Зефир', 'шт', 8),
  (get_category_id('Сладости'), 'Пастила', 'шт', 9),
  (get_category_id('Сладости'), 'Марципан', 'шт', 10),
  (get_category_id('Сладости'), 'Мед', 'шт', 11),
  (get_category_id('Сладости'), 'Варенье', 'шт', 12),
  (get_category_id('Сладости'), 'Сгущенка', 'шт', 13),
  (get_category_id('Сладости'), 'Сахарная пудра', 'шт', 14)
ON CONFLICT DO NOTHING;

-- МАРКЕТПЛЕЙСЫ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Маркетплейсы'), 'Wildberries', 'шт', 1),
  (get_category_id('Маркетплейсы'), 'Ozon', 'шт', 2),
  (get_category_id('Маркетплейсы'), 'Яндекс Маркет', 'шт', 3),
  (get_category_id('Маркетплейсы'), 'AliExpress', 'шт', 4),
  (get_category_id('Маркетплейсы'), 'Amazon', 'шт', 5)
ON CONFLICT DO NOTHING;

-- АПТЕКА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Аптека'), 'Лекарства', 'шт', 1),
  (get_category_id('Аптека'), 'Витамины', 'шт', 2),
  (get_category_id('Аптека'), 'Бинты', 'шт', 3),
  (get_category_id('Аптека'), 'Пластырь', 'шт', 4),
  (get_category_id('Аптека'), 'Вата', 'шт', 5),
  (get_category_id('Аптека'), 'Маски', 'шт', 6),
  (get_category_id('Аптека'), 'Перчатки медицинские', 'шт', 7),
  (get_category_id('Аптека'), 'Шприцы', 'шт', 8)
ON CONFLICT DO NOTHING;

-- БЫТОВАЯ ХИМИЯ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Бытовая химия'), 'Порошок', 'шт', 1),
  (get_category_id('Бытовая химия'), 'Гель для стирки', 'шт', 2),
  (get_category_id('Бытовая химия'), 'Кондиционер для белья', 'шт', 3),
  (get_category_id('Бытовая химия'), 'Средство для мытья посуды', 'шт', 4),
  (get_category_id('Бытовая химия'), 'Средство для окон', 'шт', 5),
  (get_category_id('Бытовая химия'), 'Средство для пола', 'шт', 6),
  (get_category_id('Бытовая химия'), 'Средство для ванной', 'шт', 7),
  (get_category_id('Бытовая химия'), 'Средство для унитаза', 'шт', 8),
  (get_category_id('Бытовая химия'), 'Отбеливатель', 'шт', 9),
  (get_category_id('Бытовая химия'), 'Пятновыводитель', 'шт', 10),
  (get_category_id('Бытовая химия'), 'Губки', 'шт', 11),
  (get_category_id('Бытовая химия'), 'Тряпки', 'шт', 12),
  (get_category_id('Бытовая химия'), 'Мешки для мусора', 'шт', 13),
  (get_category_id('Бытовая химия'), 'Прочее', 'шт', 14)
ON CONFLICT DO NOTHING;

-- УБОРКА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Уборка'), 'Помыть полы', 'шт', 1),
  (get_category_id('Уборка'), 'Протереть пыль', 'шт', 2),
  (get_category_id('Уборка'), 'Помыть окна', 'шт', 3),
  (get_category_id('Уборка'), 'Пропылесосить', 'шт', 4),
  (get_category_id('Уборка'), 'Убрать в ванной', 'шт', 5),
  (get_category_id('Уборка'), 'Убрать на кухне', 'шт', 6),
  (get_category_id('Уборка'), 'Разобрать шкаф', 'шт', 7),
  (get_category_id('Уборка'), 'Вынести мусор', 'шт', 8),
  (get_category_id('Уборка'), 'Постирать вещи', 'шт', 9)
ON CONFLICT DO NOTHING;

-- СТИРКА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Стирка'), 'Постирать одежду', 'шт', 1),
  (get_category_id('Стирка'), 'Постирать постельное', 'шт', 2),
  (get_category_id('Стирка'), 'Постирать полотенца', 'шт', 3),
  (get_category_id('Стирка'), 'Погладить', 'шт', 4),
  (get_category_id('Стирка'), 'Отдать в химчистку', 'шт', 5)
ON CONFLICT DO NOTHING;

-- РЕМОНТ
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Ремонт'), 'Починить кран', 'шт', 1),
  (get_category_id('Ремонт'), 'Починить розетку', 'шт', 2),
  (get_category_id('Ремонт'), 'Повесить полку', 'шт', 3),
  (get_category_id('Ремонт'), 'Поменять лампочку', 'шт', 4),
  (get_category_id('Ремонт'), 'Заклеить обои', 'шт', 5),
  (get_category_id('Ремонт'), 'Починить дверь', 'шт', 6),
  (get_category_id('Ремонт'), 'Покрасить', 'шт', 7)
ON CONFLICT DO NOTHING;

-- САД
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Сад'), 'Полить цветы', 'шт', 1),
  (get_category_id('Сад'), 'Посадить растения', 'шт', 2),
  (get_category_id('Сад'), 'Подстричь газон', 'шт', 3),
  (get_category_id('Сад'), 'Убрать листья', 'шт', 4),
  (get_category_id('Сад'), 'Удобрить', 'шт', 5),
  (get_category_id('Сад'), 'Прополка', 'шт', 6)
ON CONFLICT DO NOTHING;

-- ГОТОВКА
INSERT INTO task_items (category_id, name, unit, "order") VALUES
  (get_category_id('Готовка'), 'Приготовить завтрак', 'шт', 1),
  (get_category_id('Готовка'), 'Приготовить обед', 'шт', 2),
  (get_category_id('Готовка'), 'Приготовить ужин', 'шт', 3),
  (get_category_id('Готовка'), 'Испечь пирог', 'шт', 4),
  (get_category_id('Готовка'), 'Сделать заготовки', 'шт', 5)
ON CONFLICT DO NOTHING;

-- RLS Policies for task_items
ALTER TABLE task_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read task items" ON task_items
  FOR SELECT USING (true);

-- Add realtime for task_items
ALTER PUBLICATION supabase_realtime ADD TABLE task_items;

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
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for family_invitations
CREATE POLICY "Users can view their family invitations" ON family_invitations
  FOR SELECT USING (true);

CREATE POLICY "Users can create family invitations" ON family_invitations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update family invitations" ON family_invitations
  FOR UPDATE USING (true);

-- Enable Realtime for specific tables
-- Run these in Supabase Dashboard > Database > Replication
-- or use the following commands:

-- Add is_public column to events if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_public') THEN
    ALTER TABLE events ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE family_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

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
