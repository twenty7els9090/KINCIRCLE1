-- Update task categories with image URLs
-- Run this SQL in Supabase SQL Editor after uploading images to storage
-- Or if images are in /public/categories/ folder, they'll be available at /categories/xxx.png

-- Shopping categories
UPDATE task_categories SET image_url = '/categories/dairy.png' WHERE name = 'Молочное';
UPDATE task_categories SET image_url = '/categories/meat-fish.png' WHERE name = 'Мясо и рыба';
UPDATE task_categories SET image_url = '/categories/grocery.png' WHERE name = 'Бакалея';
UPDATE task_categories SET image_url = '/categories/vegetables-fruits.png' WHERE name = 'Овощи и фрукты';
UPDATE task_categories SET image_url = '/categories/beverages.png' WHERE name = 'Напитки';
UPDATE task_categories SET image_url = '/categories/bakery.png' WHERE name = 'Хлеб и выпечка';
UPDATE task_categories SET image_url = '/categories/sweets.png' WHERE name = 'Сладости';
UPDATE task_categories SET image_url = '/categories/marketplace.png' WHERE name = 'Маркетплейсы';
UPDATE task_categories SET image_url = '/categories/pharmacy.png' WHERE name = 'Аптека';
UPDATE task_categories SET image_url = '/categories/household-chemicals.png' WHERE name = 'Бытовая химия';

-- Home categories
UPDATE task_categories SET image_url = '/categories/cleaning.png' WHERE name = 'Уборка';
UPDATE task_categories SET image_url = '/categories/laundry.png' WHERE name = 'Стирка';
UPDATE task_categories SET image_url = '/categories/repair.png' WHERE name = 'Ремонт';
UPDATE task_categories SET image_url = '/categories/garden.png' WHERE name = 'Сад';
UPDATE task_categories SET image_url = '/categories/cooking.png' WHERE name = 'Готовка';

-- Verify the updates
SELECT name, type, image_url FROM task_categories ORDER BY "order";
