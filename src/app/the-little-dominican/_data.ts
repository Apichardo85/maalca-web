// Shared data for The Little Dominican pages
// Menu reflects the real weekly rotation: Lun/Mié/Jue/Vie/Sáb (Martes/Dom cerrado)

import type { MealPeriod, WeekDay } from '@/lib/types'

export interface MenuItem {
  id: string
  name: string
  description: string
  descriptionEn?: string
  price: number
  image: string
  category: string
  flags: { vegetarian?: boolean; spicy?: boolean; glutenFree?: boolean }
  popular?: boolean
  available: boolean
  /** Periodos en que se sirve. Vacío/undefined → all_day. */
  periods?: MealPeriod[]
  /** Días de la semana en que está disponible. Vacío/undefined → todos los días. */
  weekDays?: WeekDay[]
}

export interface LiveEvent {
  id: string
  title: string
  artistName: string
  date: string
  startTime: string
}

export interface HourEntry {
  day: string
  closed?: boolean
  open?: string
  close?: string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
  wide?: boolean
  tall?: boolean
}

export const MOCK_DISHES: MenuItem[] = [

  // ── DESAYUNO (9AM–11AM) ───────────────────────────────────────────────────
  {
    id: 'mangu', name: 'Mangú con los 3 Golpes', price: 11,
    category: 'Desayuno', flags: {}, available: true,
    periods: ['breakfast'],
    weekDays: ['monday', 'wednesday', 'friday'],
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&q=80',
    description: 'Puré de plátano verde con queso frito, salami y huevos. Clásico dominicano.',
    descriptionEn: 'Mashed green plantain with fried cheese, salami and eggs. A Dominican breakfast classic.',
  },
  {
    id: 'huevos-criolla', name: 'Huevos a la Criolla', price: 9,
    category: 'Desayuno', flags: { vegetarian: true }, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&q=80',
    description: 'Huevos revueltos con cebolla, tomate y pimientos. Servidos sobre tostada o arepa.',
    descriptionEn: 'Scrambled eggs with onion, tomato and peppers. Served on toast or arepa.',
  },
  {
    id: 'bacaladito', name: 'Bacaladito', price: 4,
    category: 'Desayuno', flags: {}, available: true,
    periods: ['breakfast'],
    weekDays: ['wednesday', 'friday'],
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&h=400&fit=crop&q=80',
    description: 'Frituras de bacalao dominicanas — crujientes, saladas y llenas de sabor. Desayuno de costa.',
    descriptionEn: 'Dominican salt cod fritters — crispy, salty and full of flavor. A coastal breakfast staple.',
  },

  // ── CRIOLLOS ─────────────────────────────────────────────────────────────
  {
    id: 'la-bandera', name: 'La Bandera Dominicana', price: 16,
    category: 'Criollos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'El plato nacional: arroz blanco con concón, habichuela guisada, pollo guisado y ensalada verde. Comida de casa, de domingo, de siempre.',
    descriptionEn: 'The national dish: white rice with concón, stewed beans, braised chicken and green salad. Home cooking, Sunday cooking, forever cooking.',
  },
  {
    id: 'arroz-blanco', name: 'Arroz Blanco con Concón', price: 5,
    category: 'Criollos', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Arroz blanco dominicano con concón doradito — ese que se pega y sabe a casa. Crujiente por fuera, suave por dentro.',
    descriptionEn: 'Dominican white rice with golden concón — the crispy crust from the bottom of the pot. The one that sticks and tastes like home.',
  },
  {
    id: 'habichuela-guisada', name: 'Habichuela Guisada', price: 6,
    category: 'Criollos', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Habichuelas rojas guisadas con auyama, cilantro y sofrito — la base de La Bandera dominicana. Densa, cremosa y con el sazón de la abuela.',
    descriptionEn: 'Red kidney beans stewed with auyama, cilantro and sofrito — the soul of La Bandera. Thick, creamy and seasoned just like abuela\'s.',
  },
  {
    id: 'moro-guandules', name: 'Moro de Guandules', price: 7,
    category: 'Criollos', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9c5ea?w=600&h=400&fit=crop&q=80',
    description: 'Arroz cocinado con guandules, coco y cilantro. El sabor dominicano de los sábados y los días especiales.',
    descriptionEn: 'Rice cooked with pigeon peas, coconut and cilantro. The Dominican flavor of Saturdays and special occasions.',
  },

  // ── SOPAS ─────────────────────────────────────────────────────────────────
  {
    id: 'sancocho', name: 'Sancocho', price: 14,
    category: 'Sopas', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'El guiso dominicano por excelencia: pollo, cerdo, yuca, plátano y vegetales en un caldo profundo. Plato de reunión familiar.',
    descriptionEn: 'The quintessential Dominican stew: chicken, pork, yuca, plantain and vegetables in a deep, comforting broth. A dish for family gatherings.',
  },
  {
    id: 'mondongo', name: 'Mondongo', price: 12,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Sopa de mondongo con vegetales y especias criollas. Tradicional dominicana, perfecta para reponer energías.',
    descriptionEn: 'Tripe soup with vegetables and Creole spices. A Dominican tradition, perfect for restoration.',
  },
  {
    id: 'patita-cerdo', name: 'Patita de Cerdo', price: 13,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Pata de cerdo con habichuelas blancas en salsa criolla. El sazón de los viernes en Elmira.',
    descriptionEn: 'Pork trotters with white beans in Creole sauce. Friday\'s special flavor in Elmira.',
  },

  // ── CARNES ────────────────────────────────────────────────────────────────
  {
    id: 'pollo-guisado', name: 'Pollo Guisado', price: 8,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop&q=80',
    description: 'Pollo estofado en salsa criolla con especias tradicionales.',
    descriptionEn: 'Chicken stewed in Creole sauce with traditional spices.',
  },
  {
    id: 'pollo-horno', name: 'Pollo al Horno', price: 13,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&h=400&fit=crop&q=80',
    description: 'Pollo horneado con adobo criollo hasta quedar dorado y jugoso. Sabor casero en cada mordida.',
    descriptionEn: 'Oven-roasted chicken with Creole marinade, golden and juicy. Home-cooked flavor in every bite.',
  },
  {
    id: 'bistec-encebollado', name: 'Bistec Encebollado', price: 15,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    description: 'Bistec de res con cebolla caramelizada al estilo criollo. Tierno, jugoso y lleno de sabor.',
    descriptionEn: 'Pan-seared beef steak with caramelized onions, Dominican style. Tender, juicy and full of flavor.',
  },
  {
    id: 'res-guisada', name: 'Res Guisada', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    description: 'Carne de res estofada lentamente en sofrito criollo hasta quedar tierna y sabrosa.',
    descriptionEn: 'Beef slowly stewed in Creole sofrito until tender and full of flavor.',
  },
  {
    id: 'pernil', name: 'Pernil al Horno', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Pierna de cerdo asada lentamente con sazón de la casa.',
    descriptionEn: 'Slow-roasted pork shoulder with our house seasoning.',
  },
  {
    id: 'costillas-bbq', name: 'Costillas BBQ', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop&q=80',
    description: 'Costillas de cerdo asadas con nuestra salsa BBQ dulce y ahumada. Se desprenden del hueso solas.',
    descriptionEn: 'Pork ribs roasted with our sweet and smoky BBQ sauce. Fall-off-the-bone tender.',
  },
  {
    id: 'chuletas-fritas', name: 'Chuletas Fritas', price: 13,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop&q=80',
    description: 'Chuletas de cerdo sazonadas y fritas a la perfección. Crujientes por fuera, jugosas por dentro.',
    descriptionEn: 'Seasoned pork chops fried to perfection. Crispy outside, juicy inside.',
  },
  {
    id: 'cerdo-guisado', name: 'Cerdo Guisado', price: 13,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Cerdo guisado a la criolla con ajo, cebolla y cilantro. El sazón dominicano en su máxima expresión.',
    descriptionEn: 'Pork stewed Creole-style with garlic, onion and cilantro. Dominican seasoning at its finest.',
  },
  {
    id: 'rabo', name: 'Rabo Guisado', price: 17,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday'],
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop&q=80',
    description: 'Cola de res estofada por cuatro horas. Con arroz blanco y tostones.',
    descriptionEn: 'Oxtail braised for four hours. Served with white rice and tostones.',
  },
  {
    id: 'chivo-guisado', name: 'Chivo Guisado', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['saturday'],
    image: 'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=600&h=400&fit=crop&q=80',
    description: 'Chivo guisado con especias caribeñas — el favorito de los sábados. Tierno, oscuro y aromático.',
    descriptionEn: 'Goat stewed with Caribbean spices — Saturday\'s favorite. Tender, dark and aromatic.',
  },
  {
    id: 'pechuga-crema', name: 'Pechuga a la Crema', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1604908177455-e0deb1aab44d?w=600&h=400&fit=crop&q=80',
    description: 'Pechuga de pollo en salsa cremosa de ajo y hierbas. Suave, rica y reconfortante.',
    descriptionEn: 'Chicken breast in creamy garlic and herb sauce. Soft, rich and comforting.',
  },

  // ── MARISCOS ──────────────────────────────────────────────────────────────
  {
    id: 'camarones', name: 'Camarones al Ajillo', price: 18,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa de ajo, mantequilla y vino blanco.',
    descriptionEn: 'Fresh shrimp in garlic, butter and white wine sauce.',
  },
  {
    id: 'camarones-crema', name: 'Camarones en Crema', price: 19,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa cremosa con ají y especias. Irresistibles sobre arroz blanco.',
    descriptionEn: 'Fresh shrimp in creamy pepper sauce. Irresistible over white rice.',
  },
  {
    id: 'pescado', name: 'Pescado Frito', price: 18,
    category: 'Mariscos', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&q=80',
    description: 'Pescado entero marinado con sazón criollo y frito al estilo isla.',
    descriptionEn: 'Whole fish marinated in Creole seasoning and fried island-style.',
  },
  {
    id: 'langosta-crema', name: 'Langosta en Crema', price: 28,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1559668396-c6f3a5ee78f9?w=600&h=400&fit=crop&q=80',
    description: 'Langosta en salsa cremosa de mantequilla y ajo. Lujo caribeño en cada bocado.',
    descriptionEn: 'Lobster in creamy butter and garlic sauce. Caribbean luxury in every bite.',
  },

  // ── FRITURA ───────────────────────────────────────────────────────────────
  {
    id: 'pica-pollo', name: 'Pica Pollo', price: 14,
    category: 'Fritura', flags: {}, popular: true, available: true,
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Pollo frito al estilo dominicano, crujiente y bien sazonado.',
    descriptionEn: 'Dominican-style fried chicken — crispy, well-seasoned and irresistible.',
  },
  {
    id: 'chicharron', name: 'Chicharrón', price: 14,
    category: 'Fritura', flags: {}, popular: true, available: true,
    weekDays: ['wednesday', 'thursday'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Nuestra especialidad: carne de cerdo frita a la perfección.',
    descriptionEn: 'Our specialty: pork fried to absolute perfection.',
  },
  {
    id: 'queso-frito', name: 'Queso Frito', price: 10,
    category: 'Fritura', flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&h=400&fit=crop&q=80',
    description: 'Queso tropical frito, dorado por fuera y suave por dentro.',
    descriptionEn: 'Tropical white cheese, golden and crispy outside, soft and warm inside.',
  },
  {
    id: 'chimi', name: 'Chimi', price: 11,
    category: 'Fritura', flags: {}, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&q=80',
    description: 'La hamburguesa dominicana — pollo o res con col, tomate y salsa de la casa en pan de agua. El street food nacional.',
    descriptionEn: 'The Dominican burger — chicken or beef with cabbage, tomato and house sauce on soft bread. National street food.',
  },

  // ── PICADERA ──────────────────────────────────────────────────────────────
  {
    id: 'yaroa', name: 'Yaroa de Pollo', price: 12,
    category: 'Picadera', flags: {}, available: true,
    periods: ['dinner'],
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&q=80',
    description: 'Pollo desmenuzado con papas o plátano y queso fundido.',
    descriptionEn: 'Shredded chicken over fried plantain or potato, topped with melted cheese.',
  },
  {
    id: 'empanadas', name: 'Empanadas', price: 3.50,
    category: 'Picadera', flags: {}, available: true,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop&q=80',
    description: 'Pollo, res o queso — con nuestra famosa salsa rosada.',
    descriptionEn: 'Chicken, beef or cheese — with our famous pink sauce.',
  },
  {
    id: 'kipe', name: 'Kipe', price: 3,
    category: 'Picadera', flags: {}, available: true,
    weekDays: ['monday', 'thursday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1548340748-6f1e1f0c2ac1?w=600&h=400&fit=crop&q=80',
    description: 'Croqueta de trigo y carne molida, herencia árabe-dominicana. Crujiente y sabrosa.',
    descriptionEn: 'Bulgur wheat and ground meat croquette — a Lebanese-Dominican fusion snack. Crunchy and savory.',
  },
  {
    id: 'relleno-papa', name: 'Relleno de Papa', price: 3.50,
    category: 'Picadera', flags: {}, available: true,
    weekDays: ['monday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=400&fit=crop&q=80',
    description: 'Papa rellena de carne sazonada, rebozada y frita. Bocado dominicano por excelencia.',
    descriptionEn: 'Potato stuffed with seasoned meat, breaded and fried. A quintessential Dominican bite.',
  },
  {
    id: 'chulitos', name: 'Chulitos', price: 3,
    category: 'Picadera', flags: {}, available: true,
    weekDays: ['monday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1548340748-6f1e1f0c2ac1?w=600&h=400&fit=crop&q=80',
    description: 'Rollitos de yuca rellenos de queso o carne. Crujientes por fuera, suaves y sabrosos por dentro.',
    descriptionEn: 'Yuca rolls filled with cheese or meat. Crispy outside, soft and flavorful inside.',
  },

  // ── ACOMPAÑANTES ──────────────────────────────────────────────────────────
  {
    id: 'mofongo', name: 'Mofongo', price: 12,
    category: 'Acompañantes', flags: { glutenFree: true }, popular: true, available: true,
    weekDays: ['monday', 'wednesday'],
    image: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg',
    description: 'Plátano frito majado con ajo y chicharrón. Comfort food quisqueyano.',
    descriptionEn: 'Fried green plantain mashed with garlic and chicharrón. Dominican comfort food.',
  },
  {
    id: 'tostones', name: 'Tostones', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1604330941765-f3da5e5c6f11?w=600&h=400&fit=crop&q=80',
    description: 'Plátano verde aplastado y frito dos veces hasta quedar dorado y crujiente. El acompañante dominicano.',
    descriptionEn: 'Green plantain flattened and double-fried until golden and crispy. The Dominican side dish.',
  },
  {
    id: 'platano-maduro', name: 'Plátano Maduro', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop&q=80',
    description: 'Plátano maduro frito, suave y dulce. El complemento perfecto de cualquier plato criollo.',
    descriptionEn: 'Fried sweet plantain, soft and sweet. The perfect complement to any Creole dish.',
  },
  {
    id: 'papa', name: 'Papas Fritas', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&h=400&fit=crop&q=80',
    description: 'Papas fritas doradas y crujientes. Simples, perfectas.',
    descriptionEn: 'Golden crispy fries — simple, perfect.',
  },

]

export const MENU_CATEGORIES = [
  'Desayuno', 'Criollos', 'Sopas', 'Carnes', 'Mariscos', 'Fritura', 'Picadera', 'Acompañantes',
]

// Home grid destacados — identidad dominicana primero
export const FEATURED_DISHES = ['la-bandera', 'arroz-blanco', 'habichuela-guisada', 'pollo-guisado']

export const MOCK_EVENTS: LiveEvent[] = [
  { id: '1', title: 'Noche de Bachata',  artistName: 'DJ Caribe',       date: '2026-03-28', startTime: '8:00 PM' },
  { id: '2', title: 'Merengue en Vivo',  artistName: 'Grupo Quisqueya', date: '2026-04-04', startTime: '7:30 PM' },
]

export const HOURS: HourEntry[] = [
  { day: 'Lunes',      open: '9:00 AM', close: '8:00 PM' },
  { day: 'Martes',     closed: true },
  { day: 'Miércoles',  open: '9:00 AM', close: '8:00 PM' },
  { day: 'Jueves',     open: '9:00 AM', close: '8:00 PM' },
  { day: 'Viernes',    open: '9:00 AM', close: '8:00 PM' },
  { day: 'Sábado',     open: '9:00 AM', close: '8:00 PM' },
  { day: 'Domingo',    closed: true },
]

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'g-parrillada-hero', src: '/images/affiliates/tld/photos/parrillada-mixta-01.jpg', alt: 'Parrillada mixta — pollo, chorizo, costilla con tostones', category: 'Platos', wide: true },
  { id: 'g-pollo-plancha',   src: '/images/affiliates/tld/photos/pollo-plancha-01.jpg',    alt: 'Pollo a la plancha con arroz y yuca frita', category: 'Platos' },
  { id: 'g-habichuelas-02',  src: '/images/affiliates/tld/photos/habichuelas-con-dulce-02.jpg', alt: 'Habichuelas con dulce con galleticas', category: 'Postres', wide: true },
  { id: 'g-moros-maduro',    src: '/images/affiliates/tld/photos/moros-con-maduro-01.jpg', alt: 'Moros con maduro y papas criollas', category: 'Platos' },
  { id: 'g1',  src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop&q=80', alt: 'Chicharrón crujiente',      category: 'Platos', tall: true },
  { id: 'g2',  src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=500&fit=crop&q=80', alt: 'Camarones al ajillo',       category: 'Platos', wide: true },
  { id: 'g3',  src: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=500&fit=crop&q=80', alt: 'Costillas BBQ',             category: 'Platos' },
  { id: 'g4',  src: '/images/affiliates/tld/photos/pezcado-frito.jpg',                     alt: 'Pescado frito entero',      category: 'Platos', tall: true },
  { id: 'g5',  src: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=500&fit=crop&q=80', alt: 'Pollo guisado dominicano',  category: 'Platos' },
  { id: 'g6',  src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80', alt: 'Pernil asado',              category: 'Platos', wide: true },
  { id: 'g7',  src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop&q=80', alt: 'Ambiente del restaurante',  category: 'Ambiente', tall: true },
  { id: 'g8',  src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80', alt: 'Salón principal',          category: 'Ambiente', wide: true },
  { id: 'g9',  src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80', alt: 'Mesa preparada',           category: 'Ambiente' },
  { id: 'g10', src: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=500&fit=crop&q=80', alt: 'Yaroa de pollo',            category: 'Especiales' },
  { id: 'g11', src: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg',          alt: 'Mofongo bowl',             category: 'Especiales', tall: true },
  { id: 'g12', src: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=500&fit=crop&q=80', alt: 'Rabo guisado',            category: 'Especiales', wide: true },
]
