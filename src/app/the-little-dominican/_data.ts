// Shared data for The Little Dominican pages
// TODO: Replace with fetch from Umbraco Delivery API v2

import type { MealPeriod } from '@/lib/types'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  flags: { vegetarian?: boolean; spicy?: boolean; glutenFree?: boolean }
  popular?: boolean
  available: boolean
  /** Periodos en que se sirve. Vacío/undefined → all_day (siempre). */
  periods?: MealPeriod[]
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
  { id: 'yaroa',       name: 'Yaroa de Pollo',      price: 12,   category: 'Picadera',   flags: {},                   available: true,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&q=80',
    description: 'Pollo desmenuzado con papas o plátano y queso fundido.' },
  // Fritura
  { id: 'pica-pollo',  name: 'Pica Pollo',          price: 14,   category: 'Fritura',    flags: {},                   popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80',
    description: 'Pollo frito al estilo dominicano, crujiente y bien sazonado.' },
  { id: 'chicharron',  name: 'Chicharrón',          price: 14,   category: 'Fritura',    flags: {},                   popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop&q=80',
    description: 'Nuestra especialidad: carne de cerdo frita a la perfección.' },
  { id: 'queso-frito', name: 'Queso Frito',         price: 10,   category: 'Fritura',    flags: { vegetarian: true }, available: true,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&h=400&fit=crop&q=80',
    description: 'Queso tropical frito, dorado por fuera y suave por dentro.' },
  // Carnes
  { id: 'pernil',      name: 'Pernil / Pork',       price: 14,   category: 'Carnes',     flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    description: 'Cerdo asado lentamente con sazón de la casa.' },
  { id: 'pollo-guisado', name: 'Pollo Guisado',     price: 8,    category: 'Carnes',     flags: { glutenFree: true }, available: true,
    periods: ['lunch', 'dinner'],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop&q=80',
    description: 'Pollo estofado en salsa criolla con especias tradicionales.' },
  { id: 'pollo-plancha', name: 'Pollo a la Plancha', price: 15, category: 'Carnes',     flags: { glutenFree: true }, popular: true, available: true,
    periods: ['lunch', 'dinner'],
    image: '/images/affiliates/tld/photos/pollo-plancha-01.jpg',
    description: 'Pechuga marinada a la plancha, servida con arroz blanco y yuca frita con salsa de ajo.' },
  { id: 'parrillada-mixta', name: 'Parrillada Mixta', price: 32, category: 'Carnes', flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    image: '/images/affiliates/tld/photos/parrillada-mixta-01.jpg',
    description: 'Tabla para compartir: pollo, chorizo, costilla y chuleta a la parrilla, con tostones, yuca y fries. Ideal para 2-3 personas.' },
  { id: 'churrasco',   name: 'Churrasco',           price: 18,   category: 'Carnes',     flags: { glutenFree: true }, popular: true, available: true,
    periods: ['dinner'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80',
    description: 'Skirt steak tierno a la parrilla. Servido con chimichurri de la casa.' },
  { id: 'rabo',        name: 'Rabo Guisado',        price: 17,   category: 'Carnes',     flags: { glutenFree: true }, available: true,
    periods: ['dinner'],
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop&q=80',
    description: 'Cola de res estofada por cuatro horas. Con arroz blanco y tostones.' },
  // Mariscos
  { id: 'camarones',   name: 'Camarones al Ajillo', price: 18,   category: 'Mariscos',   flags: { glutenFree: true }, popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&q=80',
    description: 'Camarones frescos en salsa de ajo, mantequilla y vino blanco.' },
  { id: 'pescado',     name: 'Pescado Frito',       price: 18,   category: 'Mariscos',   flags: { glutenFree: true }, available: true,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&q=80',
    description: 'Pescado entero marinado con sazón criollo y frito al estilo isla.' },
  // Appetizers / Sides
  { id: 'empanadas',   name: 'Empanadas',           price: 3.50, category: 'Appetizers', flags: {},                   available: true,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop&q=80',
    description: 'Pollo, Res o Queso — con nuestra famosa salsa rosada.' },
  { id: 'mofongo',     name: 'Mofongo Bowl',        price: 12,   category: 'Sides',      flags: { glutenFree: true }, popular: true, available: true,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop&q=80',
    description: 'Plátano frito majado con ajo y chicharrón. Comfort food quisqueyano.' },
  // Postres tradicionales
  { id: 'habichuelas-con-dulce', name: 'Habichuelas con Dulce', price: 7, category: 'Postres', flags: { vegetarian: true }, popular: true, available: true,
    image: '/images/affiliates/tld/photos/habichuelas-con-dulce-01.jpg',
    description: 'El postre de la Cuaresma dominicana: habichuelas rojas, leche, batata, canela y clavo, servido con galleticas de soda. Receta de abuela.' },
]

// Demo breakfast items (disponible solo 7am-11am)
MOCK_DISHES.push(
  { id: 'mangu', name: 'Mangú con los 3 Golpes', price: 11, category: 'Desayuno', flags: {}, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&q=80',
    description: 'Puré de plátano verde con queso frito, salami y huevos. Clásico dominicano.' },
  { id: 'tres-golpes', name: 'Huevos Rancheros', price: 9, category: 'Desayuno', flags: { vegetarian: true }, available: true,
    periods: ['breakfast'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&q=80',
    description: 'Huevos revueltos con cebolla, tomate y pimientos. Sobre tostada o arepa.' },
)

export const MENU_CATEGORIES = ['Desayuno', 'Picadera', 'Fritura', 'Carnes', 'Mariscos', 'Appetizers', 'Sides', 'Postres']

export const FEATURED_DISHES = ['parrillada-mixta', 'pollo-plancha', 'habichuelas-con-dulce', 'mofongo']

export const MOCK_EVENTS: LiveEvent[] = [
  { id: '1', title: 'Noche de Bachata',  artistName: 'DJ Caribe',       date: '2026-03-28', startTime: '8:00 PM' },
  { id: '2', title: 'Merengue en Vivo',  artistName: 'Grupo Quisqueya', date: '2026-04-04', startTime: '7:30 PM' },
]

export const HOURS: HourEntry[] = [
  { day: 'Lunes',      closed: true },
  { day: 'Martes',     open: '11:00 AM', close: '9:00 PM'  },
  { day: 'Miércoles',  open: '11:00 AM', close: '9:00 PM'  },
  { day: 'Jueves',     open: '11:00 AM', close: '9:00 PM'  },
  { day: 'Viernes',    open: '11:00 AM', close: '10:00 PM' },
  { day: 'Sábado',     open: '11:00 AM', close: '10:00 PM' },
  { day: 'Domingo',    open: '12:00 PM', close: '8:00 PM'  },
]

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'g-parrillada-hero', src: '/images/affiliates/tld/photos/parrillada-mixta-01.jpg', alt: 'Parrillada mixta — pollo, chorizo, costilla con tostones',
    category: 'Platos', wide: true },
  { id: 'g-parrillada-close', src: '/images/affiliates/tld/photos/parrillada-mixta-02.jpg', alt: 'Parrillada mixta close-up con limón y pimientos',
    category: 'Platos', tall: true },
  { id: 'g-pollo-plancha', src: '/images/affiliates/tld/photos/pollo-plancha-01.jpg', alt: 'Pollo a la plancha con arroz y yuca frita',
    category: 'Platos' },
  { id: 'g-habichuelas-01', src: '/images/affiliates/tld/photos/habichuelas-con-dulce-01.jpg', alt: 'Habichuelas con dulce en pilones de barro',
    category: 'Postres', wide: true },
  { id: 'g-habichuelas-02', src: '/images/affiliates/tld/photos/habichuelas-con-dulce-02.jpg', alt: 'Habichuelas con dulce close-up con galleticas',
    category: 'Postres', tall: true },
  { id: 'g1',  src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop&q=80',  alt: 'Chicharrón crujiente',        category: 'Platos', tall: true },
  { id: 'g2',  src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=500&fit=crop&q=80',  alt: 'Camarones al ajillo',      category: 'Platos', wide: true },
  { id: 'g3',  src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',  alt: 'Churrasco a la parrilla',     category: 'Platos' },
  { id: 'g4',  src: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop&q=80',  alt: 'Pescado frito entero',      category: 'Platos', tall: true },
  { id: 'g5',  src: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=500&fit=crop&q=80',  alt: 'Pollo guisado dominicano',  category: 'Platos' },
  { id: 'g6',  src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80',  alt: 'Pernil asado',                category: 'Platos', wide: true },
  { id: 'g7',  src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop&q=80',  alt: 'Ambiente del restaurante',    category: 'Ambiente', tall: true },
  { id: 'g8',  src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80',  alt: 'Salón principal',           category: 'Ambiente', wide: true },
  { id: 'g9',  src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80',  alt: 'Mesa preparada',            category: 'Ambiente' },
  { id: 'g10', src: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=500&fit=crop&q=80',  alt: 'Yaroa de pollo',              category: 'Especiales' },
  { id: 'g11', src: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop&q=80', alt: 'Mofongo bowl',               category: 'Especiales', tall: true },
  { id: 'g12', src: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=500&fit=crop&q=80', alt: 'Rabo guisado',               category: 'Especiales', wide: true },
]
