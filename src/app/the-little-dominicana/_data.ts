// The Little Dominicana Restaurant — menu data
// Lun–Sáb abierto. Dom cerrado.
//
// MODELO DE PRECIOS:
//   El precio está en la CARNE — incluye arroz y habichuela a elegir al ordenar.
//   Acompañantes (tostones, mofongo, etc.) SÍ tienen precio propio.
//   Categoría "Incluidos" = sides que van con la carne, NO aparecen en el menú público.

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
  periods?: MealPeriod[]
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
    weekDays: ['wednesday', 'friday'],
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&q=80',
    description: 'Puré de plátano verde con queso frito, salami y huevos. El desayuno dominicano por excelencia.',
    descriptionEn: 'Mashed green plantain with fried cheese, salami and eggs. The quintessential Dominican breakfast.',
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
    id: 'arepa', name: 'Arepa Dominicana', price: 4,
    category: 'Desayuno', flags: { vegetarian: true }, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=600&h=400&fit=crop&q=80',
    description: 'Arepa de maíz dominicana, suave y ligeramente dulce. Perfecta sola o con queso.',
    descriptionEn: 'Dominican corn arepa, soft and slightly sweet. Perfect plain or with cheese.',
  },
  {
    id: 'tostada', name: 'Tostada', price: 3,
    category: 'Desayuno', flags: { vegetarian: true }, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&q=80',
    description: 'Pan tostado con mantequilla. Sencillo y clásico.',
    descriptionEn: 'Buttered toast. Simple and classic.',
  },
  {
    id: 'bacaladito', name: 'Bacaladito', price: 4,
    category: 'Desayuno', flags: {}, available: true,
    periods: ['breakfast'],
    weekDays: ['wednesday', 'friday'],
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&h=400&fit=crop&q=80',
    description: 'Frituras de bacalao dominicanas — crujientes, saladas y llenas de sabor.',
    descriptionEn: 'Dominican salt cod fritters — crispy, salty and full of flavor.',
  },

  // ── BEBIDAS ───────────────────────────────────────────────────────────────
  {
    id: 'batida-fruta', name: 'Batida de Fruta', price: 4,
    category: 'Bebidas', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&h=400&fit=crop&q=80',
    description: 'Batida de fruta fresca de temporada con leche. Preguntar disponibilidad del día.',
    descriptionEn: 'Fresh seasonal fruit milkshake with milk. Ask about today\'s fruit.',
  },
  {
    id: 'batida-papaya', name: 'Batida de Papaya', price: 4,
    category: 'Bebidas', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop&q=80',
    description: 'Batida cremosa de papaya con leche. Refrescante y naturalmente dulce.',
    descriptionEn: 'Creamy papaya smoothie with milk. Refreshing and naturally sweet.',
  },
  {
    id: 'morir-sonando', name: 'Morir Soñando', price: 5,
    category: 'Bebidas', flags: { vegetarian: true, glutenFree: true }, available: true,
    image: 'https://images.unsplash.com/photo-1534353341086-f7c2f0988b0f?w=600&h=400&fit=crop&q=80',
    description: 'Jugo de naranja con leche evaporada y azúcar. El clásico dominicano que "mata de sabor".',
    descriptionEn: 'Orange juice with evaporated milk and sugar. The classic Dominican drink that\'s "to die for".',
  },

  // ── CARNES / PLATOS COMPLETOS ─────────────────────────────────────────────
  // Precio = plato completo. Incluye arroz (blanco, moro o vegetales) y habichuela a elegir.
  {
    id: 'la-bandera', name: 'La Bandera Dominicana', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'El plato nacional: arroz blanco, habichuela roja, pollo guisado y ensalada. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'The national dish: white rice, red beans, braised chicken and salad. Includes rice and beans of your choice.',
  },
  {
    id: 'pollo-guisado', name: 'Pollo Guisado', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop&q=80',
    description: 'Pollo estofado en salsa criolla con ajo y especias. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Chicken stewed in Creole sauce with garlic and spices. Includes rice and beans of your choice.',
  },
  {
    id: 'pollo-horno', name: 'Pollo al Horno', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&h=400&fit=crop&q=80',
    description: 'Pollo horneado con adobo criollo, dorado y jugoso. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Oven-roasted chicken with Creole marinade, golden and juicy. Includes rice and beans of your choice.',
  },
  {
    id: 'pollo-frito', name: 'Pollo Frito', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Pollo frito entero o en piezas, dorado y crujiente. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Whole or pieced fried chicken, golden and crispy. Includes rice and beans of your choice.',
  },
  {
    id: 'bistec-encebollado', name: 'Bistec Encebollado', price: 15,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    description: 'Bistec de res con cebolla caramelizada al estilo criollo. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Pan-seared beef steak with caramelized onions, Dominican style. Includes rice and beans of your choice.',
  },
  {
    id: 'res-guisada', name: 'Res Guisada', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    description: 'Carne de res estofada lentamente en sofrito criollo. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Beef slowly stewed in Creole sofrito until tender. Includes rice and beans of your choice.',
  },
  {
    id: 'pernil', name: 'Pernil al Horno', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Pierna de cerdo asada lentamente con sazón de la casa. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Slow-roasted pork shoulder with house seasoning. Includes rice and beans of your choice.',
  },
  {
    id: 'costillas-bbq', name: 'Costillas BBQ', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop&q=80',
    description: 'Costillas de cerdo con nuestra salsa BBQ dulce y ahumada. Incluye arroz y habichuela.',
    descriptionEn: 'Pork ribs with sweet and smoky BBQ sauce. Includes rice and beans.',
  },
  {
    id: 'chuletas-fritas', name: 'Chuletas Fritas', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop&q=80',
    description: 'Chuletas de cerdo sazonadas y fritas a la perfección. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Seasoned pork chops fried to perfection. Includes rice and beans of your choice.',
  },
  {
    id: 'cerdo-guisado', name: 'Cerdo Guisado', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Cerdo guisado a la criolla con ajo, cebolla y cilantro. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Pork stewed Creole-style with garlic, onion and cilantro. Includes rice and beans of your choice.',
  },
  {
    id: 'cerdo-berenjena', name: 'Cerdo con Berenjena', price: 14,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['wednesday', 'thursday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Cerdo guisado con berenjena al estilo criollo. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Pork stewed with eggplant, Creole style. Includes rice and beans of your choice.',
  },
  {
    id: 'rabo', name: 'Rabo Guisado', price: 17,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday'],
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop&q=80',
    description: 'Cola de res estofada por cuatro horas. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Oxtail braised for four hours. Includes rice and beans of your choice.',
  },
  {
    id: 'chivo-guisado', name: 'Chivo Guisado', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['saturday'],
    image: 'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=600&h=400&fit=crop&q=80',
    description: 'Chivo guisado con especias caribeñas — el favorito de los sábados. Incluye arroz y habichuela.',
    descriptionEn: 'Goat stewed with Caribbean spices — Saturday\'s favorite. Includes rice and beans.',
  },
  {
    id: 'pechuga-crema', name: 'Pechuga a la Crema', price: 16,
    category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1604908177455-e0deb1aab44d?w=600&h=400&fit=crop&q=80',
    description: 'Pechuga de pollo en salsa cremosa de ajo y hierbas. Incluye arroz y habichuela a tu elección.',
    descriptionEn: 'Chicken breast in creamy garlic and herb sauce. Includes rice and beans of your choice.',
  },
  {
    id: 'espaguetis', name: 'Espaguetis Dominicanos', price: 12,
    category: 'Carnes', flags: {}, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80',
    description: 'Espaguetis al estilo dominicano con pollo o res, pimientos y salsa criolla.',
    descriptionEn: 'Dominican-style spaghetti with chicken or beef, peppers and Creole sauce.',
  },

  // ── SOPAS ─────────────────────────────────────────────────────────────────
  {
    id: 'sancocho', name: 'Sancocho', price: 14,
    category: 'Sopas', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'El guiso dominicano por excelencia: pollo, cerdo, yuca, plátano y vegetales en caldo profundo. Solo los jueves.',
    descriptionEn: 'The quintessential Dominican stew: chicken, pork, yuca, plantain and vegetables in a deep broth. Thursdays only.',
  },
  {
    id: 'mondongo', name: 'Mondongo', price: 12,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Sopa de mondongo con vegetales y especias criollas. Tradicional dominicana.',
    descriptionEn: 'Tripe soup with vegetables and Creole spices. A Dominican tradition.',
  },
  {
    id: 'patita-cerdo', name: 'Patica de Cerdo con Habichuela Blanca', price: 13,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Pata de cerdo con habichuelas blancas en salsa criolla. El sazón de los viernes.',
    descriptionEn: 'Pork trotters with white beans in Creole sauce. Friday\'s special flavor.',
  },
  {
    id: 'patica-pollo-molondron', name: 'Patica de Pollo con Molondrón', price: 12,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Patas de pollo guisadas con molondrón (okra) en caldo criollo. Sabor profundo y reconfortante.',
    descriptionEn: 'Chicken feet braised with okra in Creole broth. Deep and comforting flavor.',
  },
  {
    id: 'asopao-pollo', name: 'Asopao de Pollo', price: 10,
    category: 'Sopas', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Arroz caldoso con pollo guisado y vegetales. El comfort food dominicano en plato hondo.',
    descriptionEn: 'Soupy rice with braised chicken and vegetables. Dominican comfort food in a bowl.',
  },
  {
    id: 'sopa-pollo-fideos', name: 'Sopa de Pollo con Fideos', price: 9,
    category: 'Sopas', flags: {}, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Sopa de pollo con fideos finos y vegetales. Reconfortante y casera.',
    descriptionEn: 'Chicken noodle soup with thin pasta and vegetables. Comforting and homestyle.',
  },

  // ── MARISCOS ──────────────────────────────────────────────────────────────
  {
    id: 'camarones', name: 'Camarones al Ajillo', price: 18,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa de ajo, mantequilla y vino blanco. Incluye arroz a tu elección.',
    descriptionEn: 'Fresh shrimp in garlic, butter and white wine sauce. Includes rice of your choice.',
  },
  {
    id: 'camarones-crema', name: 'Camarones en Crema', price: 19,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa cremosa con ají y especias. Incluye arroz a tu elección.',
    descriptionEn: 'Fresh shrimp in creamy pepper sauce. Includes rice of your choice.',
  },
  {
    id: 'pechuga-ajillo', name: 'Pechuga al Ajillo', price: 16,
    category: 'Mariscos', flags: { glutenFree: true }, available: true,
    periods: ['dinner'],
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1604908177455-e0deb1aab44d?w=600&h=400&fit=crop&q=80',
    description: 'Pechuga de pollo en salsa de ajo y mantequilla al estilo mariscos. Incluye arroz a tu elección.',
    descriptionEn: 'Chicken breast in garlic butter sauce, seafood style. Includes rice of your choice.',
  },
  {
    id: 'pescado', name: 'Pescado Frito', price: 18,
    category: 'Mariscos', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&q=80',
    description: 'Pescado entero marinado con sazón criollo y frito al estilo isla. Incluye arroz y habichuela.',
    descriptionEn: 'Whole fish marinated in Creole seasoning and fried island-style. Includes rice and beans.',
  },
  {
    id: 'snapper-frito', name: 'Snapper Frito', price: 22,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['saturday'],
    image: '/images/affiliates/tld/photos/pezcado-frito.jpg',
    description: 'Snapper entero frito al estilo isla — el especial de los sábados. Incluye arroz y habichuela.',
    descriptionEn: 'Whole snapper fried island-style — Saturday\'s special. Includes rice and beans.',
  },
  {
    id: 'langosta-crema', name: 'Langosta en Crema', price: 28,
    category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1559668396-c6f3a5ee78f9?w=600&h=400&fit=crop&q=80',
    description: 'Langosta en salsa cremosa de mantequilla y ajo. Incluye arroz a tu elección.',
    descriptionEn: 'Lobster in creamy butter and garlic sauce. Includes rice of your choice.',
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
    id: 'pica-pollo-3piece', name: 'Pica Pollo 3 Piezas', price: 16,
    category: 'Fritura', flags: {}, available: true,
    weekDays: ['monday', 'wednesday'],
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Tres piezas de pollo frito dominicano. Para el apetito grande.',
    descriptionEn: 'Three pieces of Dominican fried chicken. For the bigger appetite.',
  },
  {
    id: 'pica-longa', name: 'Pica Longa', price: 25,
    category: 'Fritura', flags: {}, available: true,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Porción grande de pica pollo para compartir. El favorito para grupos.',
    descriptionEn: 'Large portion of fried chicken for sharing. The group favorite.',
  },
  {
    id: 'chicharron', name: 'Chicharrón', price: 14,
    category: 'Fritura', flags: {}, popular: true, available: true,
    weekDays: ['wednesday', 'thursday'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Carne de cerdo frita a la perfección — crujiente por fuera, tierna por dentro.',
    descriptionEn: 'Pork fried to absolute perfection — crispy outside, tender inside.',
  },
  {
    id: 'queso-frito', name: 'Queso Frito', price: 10,
    category: 'Fritura', flags: { vegetarian: true }, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
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
    description: 'La hamburguesa dominicana — pollo o res con col, tomate y salsa de la casa en pan de agua.',
    descriptionEn: 'The Dominican burger — chicken or beef with cabbage, tomato and house sauce on soft bread.',
  },
  {
    id: 'orejita-frita', name: 'Orejita Frita', price: 14,
    category: 'Fritura', flags: { glutenFree: true }, available: true,
    weekDays: ['tuesday'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Oreja de cerdo frita a la criolla — crujiente y llena de sazón dominicano.',
    descriptionEn: 'Fried pork ear, Creole style — crispy and full of Dominican seasoning.',
  },
  {
    id: 'alitas-bbq', name: 'Alitas BBQ', price: 14,
    category: 'Fritura', flags: {}, available: true,
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop&q=80',
    description: 'Alitas de pollo con salsa BBQ dulce y ahumada. Crujientes y adictivas.',
    descriptionEn: 'Chicken wings with sweet and smoky BBQ sauce. Crispy and addictive.',
  },
  {
    id: 'salami-frito', name: 'Salami Frito', price: 8,
    category: 'Fritura', flags: {}, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Salami dominicano frito, dorado y crujiente. El sabor del desayuno de la abuela.',
    descriptionEn: 'Fried Dominican salami, golden and crispy. The flavor of grandma\'s breakfast.',
  },
  {
    id: 'cerdo-frito', name: 'Cerdo Frito', price: 14,
    category: 'Fritura', flags: { glutenFree: true }, available: true,
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Trozos de cerdo fritos a la dominicana, dorados y crujientes por fuera.',
    descriptionEn: 'Dominican-style fried pork pieces, golden and crispy on the outside.',
  },
  {
    id: 'pollomitas-bbq', name: 'Pollomitas BBQ', price: 12,
    category: 'Fritura', flags: {}, available: true,
    weekDays: ['saturday'],
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Bocaditos de pollo bañados en salsa BBQ. Perfectos para compartir.',
    descriptionEn: 'Chicken bites tossed in BBQ sauce. Perfect for sharing.',
  },

  // ── PICADERA ──────────────────────────────────────────────────────────────
  {
    id: 'yaroa', name: 'Yaroa de Pollo / Yama Palo', price: 12,
    category: 'Picadera', flags: {}, available: true,
    periods: ['lunch', 'dinner'],
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&q=80',
    description: 'Pollo desmenuzado sobre papas o plátano con queso fundido. Street food dominicano.',
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
    descriptionEn: 'Bulgur wheat and ground meat croquette — Lebanese-Dominican street snack.',
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
    description: 'Rollitos de yuca rellenos de queso o carne. Crujientes por fuera, suaves por dentro.',
    descriptionEn: 'Yuca rolls filled with cheese or meat. Crispy outside, soft and flavorful inside.',
  },
  {
    id: 'mofongo-balls', name: 'Mofongo Balls', price: 4,
    category: 'Picadera', flags: { glutenFree: true }, available: true,
    weekDays: ['tuesday'],
    image: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg',
    description: 'Bocados de mofongo con chicharrón y ajo. El sabor del mofongo en un bocado.',
    descriptionEn: 'Mofongo bites with chicharrón and garlic. All the mofongo flavor in one bite.',
  },
  {
    id: 'ensalada-tuna', name: 'Ensalada de Tuna', price: 8,
    category: 'Picadera', flags: { glutenFree: true }, available: true,
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
    description: 'Ensalada de atún con vegetales frescos y mayonesa. Ligera y sabrosa.',
    descriptionEn: 'Tuna salad with fresh vegetables and mayonnaise. Light and flavorful.',
  },

  // ── ACOMPAÑANTES (precio propio, se venden solos también) ─────────────────
  {
    id: 'mofongo', name: 'Mofongo', price: 12,
    category: 'Acompañantes', flags: { glutenFree: true }, popular: true, available: true,
    weekDays: ['monday', 'tuesday', 'wednesday'],
    image: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg',
    description: 'Plátano frito majado con ajo y chicharrón. Comfort food quisqueyano.',
    descriptionEn: 'Fried green plantain mashed with garlic and chicharrón. Dominican comfort food.',
  },
  {
    id: 'tostones', name: 'Tostones', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1604330941765-f3da5e5c6f11?w=600&h=400&fit=crop&q=80',
    description: 'Plátano verde aplastado y frito dos veces, dorado y crujiente.',
    descriptionEn: 'Green plantain flattened and double-fried until golden and crispy.',
  },
  {
    id: 'platano-maduro', name: 'Plátano Maduro', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop&q=80',
    description: 'Plátano maduro frito, suave y dulce. El complemento perfecto de cualquier plato criollo.',
    descriptionEn: 'Fried sweet plantain, soft and sweet. The perfect complement to any Creole dish.',
  },
  {
    id: 'papa', name: 'French Fries', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&h=400&fit=crop&q=80',
    description: 'Papas fritas doradas y crujientes.',
    descriptionEn: 'Golden crispy fries.',
  },
  {
    id: 'batata-frita', name: 'Batata Frita', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=400&fit=crop&q=80',
    description: 'Batata dulce frita, crujiente por fuera y suave por dentro.',
    descriptionEn: 'Fried sweet potato, crispy outside and soft inside.',
  },
  {
    id: 'yuca', name: 'Yuca Frita', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=400&fit=crop&q=80',
    description: 'Yuca frita dorada y crujiente. Base de muchos platos dominicanos.',
    descriptionEn: 'Golden fried yuca, crispy and satisfying. A Dominican staple.',
  },
  {
    id: 'guineo', name: 'Guineo', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    periods: ['breakfast', 'lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1543218024-57a70143c369?w=600&h=400&fit=crop&q=80',
    description: 'Guineo verde hervido, tierno y neutro. El acompañante tradicional del campo dominicano.',
    descriptionEn: 'Boiled green banana, tender and mild. The traditional Dominican countryside side dish.',
  },
  {
    id: 'ensalada-papa', name: 'Ensalada de Papa', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['monday'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
    description: 'Ensalada de papa con mayonesa, zanahoria y vegetales. Fresca y cremosa.',
    descriptionEn: 'Potato salad with mayonnaise, carrot and vegetables. Fresh and creamy.',
  },
  {
    id: 'berenjena-ajillo', name: 'Berenjena al Ajillo', price: 6,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['friday'],
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=400&fit=crop&q=80',
    description: 'Berenjena salteada con ajo, aceite de oliva y perejil. Sencilla y deliciosa.',
    descriptionEn: 'Eggplant sautéed with garlic, olive oil and parsley. Simple and delicious.',
  },
  {
    id: 'bolas-papa', name: 'Bolas de Papa', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=400&fit=crop&q=80',
    description: 'Bolas de papa rellenas de queso o carne, fritas hasta dorar.',
    descriptionEn: 'Potato balls stuffed with cheese or meat, fried until golden.',
  },
  {
    id: 'coco-frito', name: 'Coco Frito', price: 4,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    weekDays: ['tuesday'],
    image: 'https://images.unsplash.com/photo-1583922606661-0822ed0bd916?w=600&h=400&fit=crop&q=80',
    description: 'Trozos de coco fritos, dorados y ligeramente dulces. Snack tropical.',
    descriptionEn: 'Fried coconut pieces, golden and slightly sweet. Tropical snack.',
  },
  {
    id: 'espaguetis-side', name: 'Espaguetis (side)', price: 5,
    category: 'Acompañantes', flags: {}, available: true,
    weekDays: ['thursday'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80',
    description: 'Porción de espaguetis dominicanos como acompañante.',
    descriptionEn: 'Side portion of Dominican-style spaghetti.',
  },
  {
    id: 'vegetales', name: 'Vegetales', price: 5,
    category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, available: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
    description: 'Mix de vegetales salteados o guisados del día.',
    descriptionEn: 'Mix of sautéed or stewed vegetables of the day.',
  },

  // ── INCLUIDOS (no aparecen en menú público — van con las carnes) ──────────
  {
    id: 'arroz-blanco', name: 'Arroz Blanco con Concón', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Arroz blanco dominicano con concón doradito. Incluido con las carnes.',
    descriptionEn: 'Dominican white rice with golden concón. Included with meat dishes.',
  },
  {
    id: 'habichuela-guisada', name: 'Habichuela Roja Guisada', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Habichuelas rojas guisadas con auyama y sofrito. Densa, cremosa y con el sazón de la abuela. Incluida con las carnes.',
    descriptionEn: 'Red kidney beans stewed with auyama and sofrito. Thick, creamy, like grandma\'s. Included with meat dishes.',
  },
  {
    id: 'moro-guandules', name: 'Moro de Guandules', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    weekDays: ['monday', 'wednesday', 'thursday', 'saturday'],
    image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9c5ea?w=600&h=400&fit=crop&q=80',
    description: 'Arroz cocinado con guandules, coco y cilantro. Opción de arroz incluida con las carnes.',
    descriptionEn: 'Rice cooked with pigeon peas, coconut and cilantro. Included rice option.',
  },
  {
    id: 'lenteja-guisada', name: 'Lenteja Guisada', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    weekDays: ['tuesday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Lentejas guisadas a la criolla. Habichuela del martes, incluida con las carnes.',
    descriptionEn: 'Creole-style lentil stew. Tuesday\'s bean option, included with meat dishes.',
  },
  {
    id: 'moro-habichuela-roja', name: 'Moro de Habichuela Roja', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9c5ea?w=600&h=400&fit=crop&q=80',
    description: 'Arroz con habichuela roja cocinados juntos. Opción del miércoles, incluida con las carnes.',
    descriptionEn: 'Rice cooked with red beans. Wednesday\'s rice option, included with meat dishes.',
  },
  {
    id: 'guandule-guisado', name: 'Guandule Guisado', price: 0,
    category: 'Incluidos', flags: { vegetarian: true, glutenFree: true }, available: false,
    weekDays: ['wednesday'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=80',
    description: 'Guandules guisados con sofrito. Habichuela del miércoles, incluida con las carnes.',
    descriptionEn: 'Pigeon peas stewed with sofrito. Wednesday\'s bean option, included with meat dishes.',
  },
]

export const MENU_CATEGORIES = [
  'Desayuno', 'Bebidas', 'Carnes', 'Sopas', 'Mariscos', 'Fritura', 'Picadera', 'Acompañantes',
]
// 'Incluidos' no aparece en MENU_CATEGORIES — esos items son sides que van con la carne

export const FEATURED_DISHES = ['la-bandera', 'chivo-guisado', 'sancocho', 'camarones']

export const MOCK_EVENTS: LiveEvent[] = [
  { id: '1', title: 'Noche de Bachata',  artistName: 'DJ Caribe',       date: '2026-03-28', startTime: '8:00 PM' },
  { id: '2', title: 'Merengue en Vivo',  artistName: 'Grupo Quisqueya', date: '2026-04-04', startTime: '7:30 PM' },
]

export const HOURS: HourEntry[] = [
  { day: 'Lunes',      open: '9:00 AM', close: '8:00 PM' },
  { day: 'Martes',     open: '9:00 AM', close: '8:00 PM' },
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
