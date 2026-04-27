// Shared data for The Little Dominican pages
// TODO: Replace with fetch from Umbraco Delivery API v2

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
  /** Periodos en que se sirve. Vacío/undefined → all_day (siempre). */
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
  // Picadera
  { id: 'yaroa', name: 'Yaroa de Pollo', price: 12, category: 'Picadera', flags: {}, available: true,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&q=80',
    description: 'Pollo desmenuzado con papas o plátano y queso fundido.',
    descriptionEn: 'Shredded chicken over fried plantain or potato, topped with melted cheese.' },
  // Fritura
  { id: 'pica-pollo', name: 'Pica Pollo', price: 14, category: 'Fritura', flags: {}, popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Pollo frito al estilo dominicano, crujiente y bien sazonado.',
    descriptionEn: 'Dominican-style fried chicken — crispy, well-seasoned and irresistible.' },
  { id: 'chicharron', name: 'Chicharrón', price: 14, category: 'Fritura', flags: {}, popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Nuestra especialidad: carne de cerdo frita a la perfección.',
    descriptionEn: 'Our specialty: pork fried to absolute perfection.' },
  { id: 'queso-frito', name: 'Queso Frito', price: 10, category: 'Fritura', flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&h=400&fit=crop&q=80',
    description: 'Queso tropical frito, dorado por fuera y suave por dentro.',
    descriptionEn: 'Tropical white cheese, golden and crispy outside, soft and warm inside.' },
  // Carnes
  { id: 'pernil', name: 'Pernil al Horno', price: 14, category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Pierna de cerdo asada lentamente con sazón de la casa.',
    descriptionEn: 'Slow-roasted pork shoulder with our house seasoning.' },
  { id: 'pollo-guisado', name: 'Pollo Guisado', price: 8, category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop&q=80',
    description: 'Pollo estofado en salsa criolla con especias tradicionales.',
    descriptionEn: 'Chicken stewed in Creole sauce with traditional spices.' },
  { id: 'pollo-plancha', name: 'Pollo a la Plancha', price: 15, category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/pollo-plancha-01.jpg',
    description: 'Pechuga marinada a la plancha, servida con arroz blanco y yuca frita con salsa de ajo.',
    descriptionEn: 'Marinated grilled chicken breast, served with white rice and yuca fries with garlic sauce.' },
  { id: 'parrillada-mixta', name: 'Parrillada Mixta', price: 32, category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    image: '/images/affiliates/tld/photos/parrillada-mixta-01.jpg',
    description: 'Tabla para compartir: pollo, chorizo, costilla y chuleta a la parrilla, con tostones, yuca y fries. Ideal para 2-3 personas.',
    descriptionEn: 'Sharing board: grilled chicken, chorizo, ribs and pork chop with tostones, yuca and fries. Perfect for 2–3 people.' },
  { id: 'churrasco', name: 'Churrasco', price: 18, category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80',
    description: 'Falda de res tierna a la parrilla, servida con chimichurri de la casa.',
    descriptionEn: 'Tender grilled skirt steak, served with house chimichurri.' },
  { id: 'rabo', name: 'Rabo Guisado', price: 17, category: 'Carnes', flags: { glutenFree: true }, available: true,
    periods: ['dinner'],
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop&q=80',
    description: 'Cola de res estofada por cuatro horas. Con arroz blanco y tostones.',
    descriptionEn: 'Oxtail braised for four hours. Served with white rice and tostones.' },
  // Mariscos
  { id: 'camarones', name: 'Camarones al Ajillo', price: 18, category: 'Mariscos', flags: { glutenFree: true }, popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa de ajo, mantequilla y vino blanco.',
    descriptionEn: 'Fresh shrimp in garlic, butter and white wine sauce.' },
  { id: 'pescado', name: 'Pescado Frito', price: 18, category: 'Mariscos', flags: { glutenFree: true }, available: true,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&q=80',
    description: 'Pescado entero marinado con sazón criollo y frito al estilo isla.',
    descriptionEn: 'Whole fish marinated in Creole seasoning and fried island-style.' },
  // Picadera (snacks / appetizers)
  { id: 'empanadas', name: 'Empanadas', price: 3.50, category: 'Picadera', flags: {}, available: true,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop&q=80',
    description: 'Pollo, res o queso — con nuestra famosa salsa rosada.',
    descriptionEn: 'Chicken, beef or cheese — with our famous pink sauce.' },
  // Acompañantes (sides)
  { id: 'mofongo', name: 'Mofongo', price: 12, category: 'Acompañantes', flags: { glutenFree: true }, popular: true, available: true,
    image: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg',
    description: 'Plátano frito majado con ajo y chicharrón. Comfort food quisqueyano.',
    descriptionEn: 'Fried green plantain mashed with garlic and chicharrón. Dominican comfort food.' },
  { id: 'moros-con-maduro', name: 'Moros con Maduro', price: 13, category: 'Acompañantes', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/moros-con-maduro-01.jpg',
    description: 'Arroz moro de habichuelas negras con plátano maduro frito y papas criollas. Plato tradicional de la mesa dominicana.',
    descriptionEn: 'Black bean rice with sweet fried plantain and Creole potatoes. A traditional Dominican staple.' },
  // ⭐ Criollos — el corazón dominicano
  { id: 'pollo-guisado-criollo', name: 'Pollo Guisado Criollo', price: 13, category: 'Criollos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/arroz-blanco-01.jpg',
    description: 'La estrella de la mesa dominicana. Pollo estofado en sofrito criollo con orégano, cilantro y pimientos. Servido con arroz blanco y habichuela guisada.',
    descriptionEn: 'The star of the Dominican table. Chicken stewed in Creole sofrito with oregano, cilantro and peppers. Served with white rice and stewed beans.' },
  { id: 'arroz-blanco', name: 'Arroz Blanco con Concón', price: 5, category: 'Criollos', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Arroz blanco dominicano con concón doradito en el fondo del caldero — ese que se pega y sabe a casa. Crujiente por fuera, suave por dentro.',
    descriptionEn: 'Dominican white rice with golden concón — the crispy crust from the bottom of the pot. The one that sticks and tastes like home.' },
  { id: 'habichuela-guisada', name: 'Habichuela Guisada', price: 6, category: 'Criollos', flags: { vegetarian: true, glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'Habichuelas rojas guisadas con auyama, cilantro y sofrito — la base de La Bandera dominicana. Densa, cremosa y con el sazón de la abuela.',
    descriptionEn: 'Red kidney beans stewed with auyama, cilantro and sofrito — the soul of La Bandera. Thick, creamy and seasoned just like abuela\'s.' },
  { id: 'la-bandera', name: 'La Bandera Dominicana', price: 16, category: 'Criollos', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg',
    description: 'El plato nacional: arroz blanco con concón, habichuela guisada, pollo guisado y ensalada verde. Comida de casa, de domingo, de siempre.',
    descriptionEn: 'The national dish: white rice with concón, stewed beans, braised chicken and green salad. Home cooking, Sunday cooking, forever cooking.' },
  // Postres tradicionales
  { id: 'habichuelas-con-dulce', name: 'Habichuelas con Dulce', price: 7, category: 'Postres', flags: { vegetarian: true }, popular: true, available: true,
    image: '/images/affiliates/tld/photos/habichuelas-con-dulce-02.jpg',
    description: 'El postre de la Cuaresma dominicana: habichuelas rojas, leche, batata, canela y clavo, servido con galleticas de soda. Receta de abuela.',
    descriptionEn: 'The Lenten dessert of the Dominican Republic: sweet red beans with milk, batata, cinnamon and cloves, served with soda crackers. Abuela\'s recipe.' },
]

// Demo breakfast items (disponible solo 7am-11am)
MOCK_DISHES.push(
  { id: 'mangu', name: 'Mangú con los 3 Golpes', price: 11, category: 'Desayuno', flags: {}, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&q=80',
    description: 'Puré de plátano verde con queso frito, salami y huevos. Clásico dominicano.',
    descriptionEn: 'Mashed green plantain with fried cheese, salami and eggs. A Dominican breakfast classic.' },
  { id: 'huevos-criolla', name: 'Huevos a la Criolla', price: 9, category: 'Desayuno', flags: { vegetarian: true }, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&q=80',
    description: 'Huevos revueltos con cebolla, tomate y pimientos. Servidos sobre tostada o arepa.',
    descriptionEn: 'Scrambled eggs with onion, tomato and peppers. Served on toast or arepa.' },
)

export const MENU_CATEGORIES = ['Desayuno', 'Criollos', 'Picadera', 'Fritura', 'Carnes', 'Mariscos', 'Acompañantes', 'Postres']

// Home grid destacados — identidad dominicana primero (criollos estrella), luego una carne y un postre
export const FEATURED_DISHES = ['la-bandera', 'arroz-blanco', 'habichuela-guisada', 'habichuelas-con-dulce']

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
  { id: 'g-parrillada-hero', src: '/images/affiliates/tld/photos/parrillada-mixta-01.jpg', alt: 'Parrillada mixta — pollo, chorizo, costilla con tostones',
    category: 'Platos', wide: true },
  { id: 'g-pollo-plancha', src: '/images/affiliates/tld/photos/pollo-plancha-01.jpg', alt: 'Pollo a la plancha con arroz y yuca frita',
    category: 'Platos' },
  { id: 'g-habichuelas-02', src: '/images/affiliates/tld/photos/habichuelas-con-dulce-02.jpg', alt: 'Habichuelas con dulce con galleticas',
    category: 'Postres', wide: true },
  { id: 'g-moros-maduro', src: '/images/affiliates/tld/photos/moros-con-maduro-01.jpg', alt: 'Moros con maduro y papas criollas sobre hoja de plátano',
    category: 'Platos' },
  { id: 'g1',  src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop&q=80',  alt: 'Chicharrón crujiente',        category: 'Platos', tall: true },
  { id: 'g2',  src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=500&fit=crop&q=80',  alt: 'Camarones al ajillo',      category: 'Platos', wide: true },
  { id: 'g3',  src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',  alt: 'Churrasco a la parrilla',     category: 'Platos' },
  { id: 'g4',  src: '/images/affiliates/tld/photos/pezcado-frito.jpg',  alt: 'Pescado frito entero',      category: 'Platos', tall: true },
  { id: 'g5',  src: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=500&fit=crop&q=80',  alt: 'Pollo guisado dominicano',  category: 'Platos' },
  { id: 'g6',  src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80',  alt: 'Pernil asado',                category: 'Platos', wide: true },
  { id: 'g7',  src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop&q=80',  alt: 'Ambiente del restaurante',    category: 'Ambiente', tall: true },
  { id: 'g8',  src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80',  alt: 'Salón principal',           category: 'Ambiente', wide: true },
  { id: 'g9',  src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80',  alt: 'Mesa preparada',            category: 'Ambiente' },
  { id: 'g10', src: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=500&fit=crop&q=80',  alt: 'Yaroa de pollo',              category: 'Especiales' },
  { id: 'g11', src: '/images/affiliates/tld/photos/mofongo-con-camaraones-01.jpg', alt: 'Mofongo bowl',               category: 'Especiales', tall: true },
  { id: 'g12', src: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=500&fit=crop&q=80', alt: 'Rabo guisado',               category: 'Especiales', wide: true },
]
