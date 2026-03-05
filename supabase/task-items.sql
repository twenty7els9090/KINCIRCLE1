-- Task Items (predefined items for quick search)
CREATE TABLE IF NOT EXISTS task_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  unit TEXT DEFAULT 'шт',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_items_category ON task_items(category_id);
CREATE INDEX IF NOT EXISTS idx_task_items_name ON task_items(name);

ALTER TABLE task_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read task items" ON task_items
  FOR SELECT USING (true);

-- Insert task items by category
-- Note: You need to get the actual category_id from task_categories table
-- These inserts use subqueries to get the category IDs

-- МОЛОЧНОЕ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Молоко', '/items/milk.png', 'л', 1 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сметана', '/items/sour-cream.png', 'шт', 2 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Творог', '/items/cottage-cheese.png', 'шт', 3 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сыр', '/items/cheese.png', 'шт', 4 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Йогурт', '/items/yogurt.png', 'шт', 5 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Кефир', '/items/kefir.png', 'л', 6 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Ряженка', '/items/ryazhenka.png', 'л', 7 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сливки', '/items/cream.png', 'шт', 8 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Масло сливочное', '/items/butter.png', 'шт', 9 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Яйца', '/items/eggs.png', 'шт', 10 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сырки', '/items/cheese-bars.png', 'шт', 11 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Творожный сыр', '/items/cream-cheese.png', 'шт', 12 FROM task_categories WHERE name = 'Молочное';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Плавленный сыр', '/items/processed-cheese.png', 'шт', 13 FROM task_categories WHERE name = 'Молочное';

-- МЯСО И РЫБА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Курица', '/items/chicken.png', 'кг', 1 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Говядина', '/items/beef.png', 'кг', 2 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Свинина', '/items/pork.png', 'кг', 3 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Индейка', '/items/turkey.png', 'кг', 4 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Рыба свежая', '/items/fish-fresh.png', 'кг', 5 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Рыба замороженная', '/items/fish-frozen.png', 'шт', 6 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Креветки', '/items/shrimp.png', 'кг', 7 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Фарш', '/items/minced-meat.png', 'кг', 8 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Колбаса', '/items/sausage.png', 'шт', 9 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сосиски', '/items/frankfurters.png', 'шт', 10 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Бекон', '/items/bacon.png', 'шт', 11 FROM task_categories WHERE name = 'Мясо и рыба';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Ветчина', '/items/ham.png', 'шт', 12 FROM task_categories WHERE name = 'Мясо и рыба';

-- БАКАЛЕЯ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Рис', '/items/rice.png', 'шт', 1 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Гречка', '/items/buckwheat.png', 'шт', 2 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Макароны', '/items/pasta.png', 'шт', 3 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Мука', '/items/flour.png', 'шт', 4 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сахар', '/items/sugar.png', 'шт', 5 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Соль', '/items/salt.png', 'шт', 6 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Масло подсолнечное', '/items/sunflower-oil.png', 'шт', 7 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Масло оливковое', '/items/olive-oil.png', 'шт', 8 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Масло льна', '/items/flaxseed-oil.png', 'шт', 9 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Соевый соус', '/items/soy-sauce.png', 'шт', 10 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Уксус', '/items/vinegar.png', 'шт', 11 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Специи', '/items/spices.png', 'шт', 12 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Чай', '/items/tea.png', 'шт', 13 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Кофе', '/items/coffee.png', 'шт', 14 FROM task_categories WHERE name = 'Бакалея';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Какао', '/items/cocoa.png', 'шт', 15 FROM task_categories WHERE name = 'Бакалея';

-- ОВОЩИ И ФРУКТЫ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Картофель', '/items/potato.png', 'кг', 1 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Лук', '/items/onion.png', 'кг', 2 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Морковь', '/items/carrot.png', 'кг', 3 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Огурцы', '/items/cucumber.png', 'кг', 4 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Помидоры', '/items/tomato.png', 'кг', 5 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Капуста', '/items/cabbage.png', 'шт', 6 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Чеснок', '/items/garlic.png', 'шт', 7 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Перец', '/items/pepper.png', 'кг', 8 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Авокадо', '/items/avocado.png', 'шт', 9 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Яблоки', '/items/apple.png', 'кг', 10 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Бананы', '/items/banana.png', 'кг', 11 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Апельсины', '/items/orange.png', 'кг', 12 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Лимоны', '/items/lemon.png', 'шт', 13 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Киви', '/items/kiwi.png', 'шт', 14 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Мандарины', '/items/mandarin.png', 'кг', 15 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Ананас', '/items/pineapple.png', 'шт', 16 FROM task_categories WHERE name = 'Овощи и фрукты';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Зелень', '/items/greens.png', 'шт', 17 FROM task_categories WHERE name = 'Овощи и фрукты';

-- НАПИТКИ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Вода', '/items/water.png', 'шт', 1 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Сок', '/items/juice.png', 'шт', 2 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Газировка', '/items/soda.png', 'шт', 3 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Квас', '/items/kvass.png', 'шт', 4 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Морс', '/items/mors.png', 'шт', 5 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Компот', '/items/compote.png', 'шт', 6 FROM task_categories WHERE name = 'Напитки';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Лимонад', '/items/lemonade.png', 'шт', 7 FROM task_categories WHERE name = 'Напитки';

-- ХЛЕБ И ВЫПЕЧКА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Хлеб белый', '/items/white-bread.png', 'шт', 1 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Хлеб чёрный', '/items/black-bread.png', 'шт', 2 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Батон', '/items/baguette.png', 'шт', 3 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Булочки', '/items/buns.png', 'шт', 4 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Круассаны', '/items/croissant.png', 'шт', 5 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Лаваш', '/items/lavash.png', 'шт', 6 FROM task_categories WHERE name = 'Хлеб и выпечка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Пирожки', '/items/pies.png', 'шт', 7 FROM task_categories WHERE name = 'Хлеб и выпечка';

-- СЛАДОСТИ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Шоколад', '/items/chocolate.png', 'шт', 1 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Конфеты', '/items/candy.png', 'шт', 2 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Печенье', '/items/cookies.png', 'шт', 3 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Торт', '/items/cake.png', 'шт', 4 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Мороженое', '/items/ice-cream.png', 'шт', 5 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Зефир', '/items/marshmallow.png', 'шт', 6 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Пастила', '/items/pastila.png', 'шт', 7 FROM task_categories WHERE name = 'Сладости';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Мармелад', '/items/marmalade.png', 'шт', 8 FROM task_categories WHERE name = 'Сладости';

-- МАРКЕТПЛЕЙСЫ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заказ с Ozon', '/items/ozon.png', 'шт', 1 FROM task_categories WHERE name = 'Маркетплейсы';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заказ с Wildberries', '/items/wildberries.png', 'шт', 2 FROM task_categories WHERE name = 'Маркетплейсы';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заказ с Яндекс.Маркета', '/items/yandex-market.png', 'шт', 3 FROM task_categories WHERE name = 'Маркетплейсы';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заказ с AliExpress', '/items/aliexpress.png', 'шт', 4 FROM task_categories WHERE name = 'Маркетплейсы';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Посылка с почты', '/items/package.png', 'шт', 5 FROM task_categories WHERE name = 'Маркетплейсы';

-- АПТЕКА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Лекарства', '/items/medicine.png', 'шт', 1 FROM task_categories WHERE name = 'Аптека';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Витамины', '/items/vitamins.png', 'шт', 2 FROM task_categories WHERE name = 'Аптека';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Бинты', '/items/bandage.png', 'шт', 3 FROM task_categories WHERE name = 'Аптека';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Пластыри', '/items/plasters.png', 'шт', 4 FROM task_categories WHERE name = 'Аптека';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Маски', '/items/mask.png', 'шт', 5 FROM task_categories WHERE name = 'Аптека';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Антисептик', '/items/antiseptic.png', 'шт', 6 FROM task_categories WHERE name = 'Аптека';

-- БЫТОВАЯ ХИМИЯ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Порошок', '/items/powder.png', 'шт', 1 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Гель для стирки', '/items/laundry-gel.png', 'шт', 2 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Мыло', '/items/soap.png', 'шт', 3 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Шампунь', '/items/shampoo.png', 'шт', 4 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Гель для душа', '/items/shower-gel.png', 'шт', 5 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Зубная паста', '/items/toothpaste.png', 'шт', 6 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Средство для посуды', '/items/dish-soap.png', 'шт', 7 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Средство для пола', '/items/floor-cleaner.png', 'шт', 8 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Средство для окон', '/items/window-cleaner.png', 'шт', 9 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Отбеливатель', '/items/bleach.png', 'шт', 10 FROM task_categories WHERE name = 'Бытовая химия';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Прочее', '/items/other-chemical.png', 'шт', 11 FROM task_categories WHERE name = 'Бытовая химия';

-- УБОРКА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Помыть полы', '/items/mop.png', 'шт', 1 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Протереть пыль', '/items/duster.png', 'шт', 2 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Помыть окна', '/items/window.png', 'шт', 3 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Почистить ковёр', '/items/carpet.png', 'шт', 4 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Убрать в шкафу', '/items/cabinet.png', 'шт', 5 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Почистить духовку', '/items/oven.png', 'шт', 6 FROM task_categories WHERE name = 'Уборка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Постирать вещи', '/items/laundry.png', 'шт', 7 FROM task_categories WHERE name = 'Уборка';

-- СТИРКА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Постирать бельё', '/items/laundry-basket.png', 'шт', 1 FROM task_categories WHERE name = 'Стирка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Погладить одежду', '/items/iron.png', 'шт', 2 FROM task_categories WHERE name = 'Стирка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Отдать в химчистку', '/items/dry-clean.png', 'шт', 3 FROM task_categories WHERE name = 'Стирка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Стирка штор', '/items/curtains.png', 'шт', 4 FROM task_categories WHERE name = 'Стирка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Постирать обувь', '/items/shoes.png', 'шт', 5 FROM task_categories WHERE name = 'Стирка';

-- РЕМОНТ
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Починить кран', '/items/faucet.png', 'шт', 1 FROM task_categories WHERE name = 'Ремонт';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заменить лампочку', '/items/lightbulb.png', 'шт', 2 FROM task_categories WHERE name = 'Ремонт';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Починить дверь', '/items/door.png', 'шт', 3 FROM task_categories WHERE name = 'Ремонт';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Покрасить', '/items/paint.png', 'шт', 4 FROM task_categories WHERE name = 'Ремонт';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Повесить полку', '/items/shelf.png', 'шт', 5 FROM task_categories WHERE name = 'Ремонт';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заклеить', '/items/tape.png', 'шт', 6 FROM task_categories WHERE name = 'Ремонт';

-- САД
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Полить цветы', '/items/watering-can.png', 'шт', 1 FROM task_categories WHERE name = 'Сад';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Подкормить растения', '/items/fertilizer.png', 'шт', 2 FROM task_categories WHERE name = 'Сад';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Посадить', '/items/plant.png', 'шт', 3 FROM task_categories WHERE name = 'Сад';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Прополка', '/items/weed.png', 'шт', 4 FROM task_categories WHERE name = 'Сад';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Обрезать', '/items/pruning.png', 'шт', 5 FROM task_categories WHERE name = 'Сад';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Собрать урожай', '/items/harvest.png', 'шт', 6 FROM task_categories WHERE name = 'Сад';

-- ГОТОВКА
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Приготовить завтрак', '/items/breakfast.png', 'шт', 1 FROM task_categories WHERE name = 'Готовка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Приготовить обед', '/items/lunch.png', 'шт', 2 FROM task_categories WHERE name = 'Готовка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Приготовить ужин', '/items/dinner.png', 'шт', 3 FROM task_categories WHERE name = 'Готовка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Испечь пирог', '/items/pie.png', 'шт', 4 FROM task_categories WHERE name = 'Готовка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Замариновать', '/items/marinade.png', 'шт', 5 FROM task_categories WHERE name = 'Готовка';
INSERT INTO task_items (category_id, name, image_url, unit, "order")
SELECT id, 'Заморозить заготовки', '/items/freezer.png', 'шт', 6 FROM task_categories WHERE name = 'Готовка';

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE task_items;
