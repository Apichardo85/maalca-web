import type { Product, Bundle, BeforeAfterImage } from '@/lib/types/commerce.types';

// ============================================
// PRODUCTOS - PEGOTE BARBERSHOP
// ============================================

export const pegoteProducts: Product[] = [
  // CUIDADO DEL CABELLO
  {
    id: 'pomada-suavecito',
    name: 'Pomada Suavecito Original',
    nameEn: 'Suavecito Original Pomade',
    description: 'Pomada de fijación fuerte con acabado brillante. Perfecta para estilos clásicos.',
    descriptionEn: 'Strong hold pomade with high shine finish. Perfect for classic styles.',
    price: 12.99,
    compareAtPrice: 15.99,
    images: ['/images/products/pomada-suavecito.jpg'],
    category: 'hair-care',
    brand: 'Suavecito',
    inStock: true,
    stockQuantity: 24,
    rating: 4.8,
    reviewCount: 156,
    featured: true,
    tags: ['fijación-fuerte', 'brillo-alto', 'best-seller']
  },
  {
    id: 'cera-matte',
    name: 'Cera Mate American Crew',
    nameEn: 'American Crew Matte Wax',
    description: 'Cera mate para estilos texturizados y naturales. Fijación media.',
    descriptionEn: 'Matte wax for textured and natural styles. Medium hold.',
    price: 14.99,
    images: ['/images/products/cera-mate.jpg'],
    category: 'hair-care',
    brand: 'American Crew',
    inStock: true,
    stockQuantity: 18,
    rating: 4.6,
    reviewCount: 89,
    featured: false
  },
  {
    id: 'aceite-argan',
    name: 'Aceite de Argán Premium',
    nameEn: 'Premium Argan Oil',
    description: 'Aceite nutritivo para cabello afro y rizado. Brillo natural y suavidad.',
    descriptionEn: 'Nourishing oil for afro and curly hair. Natural shine and softness.',
    price: 18.99,
    images: ['/images/products/aceite-argan.jpg'],
    category: 'hair-care',
    brand: 'Moroccanoil',
    inStock: true,
    stockQuantity: 12,
    rating: 4.9,
    reviewCount: 203,
    featured: true
  },
  {
    id: 'shampoo-barba',
    name: 'Shampoo para Barba',
    nameEn: 'Beard Shampoo',
    description: 'Limpieza suave específica para barba. Sin sulfatos.',
    descriptionEn: 'Gentle cleansing specific for beards. Sulfate-free.',
    price: 11.99,
    images: ['/images/products/shampoo-barba.jpg'],
    category: 'beard-care',
    brand: 'Beardbrand',
    inStock: true,
    stockQuantity: 30,
    rating: 4.7,
    reviewCount: 124
  },

  // CUIDADO DE BARBA
  {
    id: 'aceite-barba-sandalwood',
    name: 'Aceite de Barba Sándalo',
    nameEn: 'Sandalwood Beard Oil',
    description: 'Aceite aromático para barba suave y manejable. Aroma a sándalo.',
    descriptionEn: 'Aromatic oil for soft and manageable beard. Sandalwood scent.',
    price: 16.99,
    compareAtPrice: 19.99,
    images: ['/images/products/aceite-barba.jpg'],
    category: 'beard-care',
    brand: 'Honest Amish',
    inStock: true,
    stockQuantity: 20,
    rating: 4.8,
    reviewCount: 167,
    featured: true
  },
  {
    id: 'balsamo-barba',
    name: 'Bálsamo de Barba',
    nameEn: 'Beard Balm',
    description: 'Bálsamo moldeador con cera de abejas. Fijación y nutrición.',
    descriptionEn: 'Styling balm with beeswax. Hold and nourishment.',
    price: 13.99,
    images: ['/images/products/balsamo-barba.jpg'],
    category: 'beard-care',
    brand: 'Viking Revolution',
    inStock: true,
    stockQuantity: 15,
    rating: 4.5,
    reviewCount: 98
  },
  {
    id: 'kit-barba-completo',
    name: 'Kit Completo Cuidado de Barba',
    nameEn: 'Complete Beard Care Kit',
    description: 'Incluye aceite, bálsamo, cepillo y peine. Todo lo necesario.',
    descriptionEn: 'Includes oil, balm, brush and comb. Everything you need.',
    price: 39.99,
    compareAtPrice: 49.99,
    images: ['/images/products/kit-barba.jpg'],
    category: 'beard-care',
    brand: 'Pegote Exclusive',
    inStock: true,
    stockQuantity: 8,
    rating: 5.0,
    reviewCount: 45,
    featured: true,
    tags: ['bundle', 'regalo', 'best-value']
  },

  // ACCESORIOS
  {
    id: 'peine-metal',
    name: 'Peine de Metal Profesional',
    nameEn: 'Professional Metal Comb',
    description: 'Peine de acero inoxidable para barberos. Duradero y preciso.',
    descriptionEn: 'Stainless steel comb for barbers. Durable and precise.',
    price: 8.99,
    images: ['/images/products/peine-metal.jpg'],
    category: 'accessories',
    brand: 'Barber Tools',
    inStock: true,
    stockQuantity: 40,
    rating: 4.6,
    reviewCount: 67
  },
  {
    id: 'cepillo-barba',
    name: 'Cepillo de Barba Cerdas Naturales',
    nameEn: 'Natural Bristle Beard Brush',
    description: 'Cepillo con cerdas de jabalí. Distribuye aceites naturales.',
    descriptionEn: 'Boar bristle brush. Distributes natural oils.',
    price: 14.99,
    images: ['/images/products/cepillo-barba.jpg'],
    category: 'accessories',
    brand: 'ZilberHaar',
    inStock: true,
    stockQuantity: 22,
    rating: 4.7,
    reviewCount: 134
  },
  {
    id: 'toalla-caliente',
    name: 'Toalla Calentadora Eléctrica',
    nameEn: 'Electric Towel Warmer',
    description: 'Para toallas calientes de barbería en casa. 220V.',
    descriptionEn: 'For hot barbershop towels at home. 220V.',
    price: 49.99,
    images: ['/images/products/toalla-caliente.jpg'],
    category: 'accessories',
    brand: 'Elite',
    inStock: true,
    stockQuantity: 5,
    rating: 4.4,
    reviewCount: 28
  },
  {
    id: 'tijeras-profesionales',
    name: 'Tijeras de Barbero Profesionales',
    nameEn: 'Professional Barber Scissors',
    description: 'Tijeras de acero japonés 6.5". Para perfilado de barba.',
    descriptionEn: 'Japanese steel scissors 6.5". For beard detailing.',
    price: 34.99,
    images: ['/images/products/tijeras.jpg'],
    category: 'accessories',
    brand: 'Joewell',
    inStock: true,
    stockQuantity: 10,
    rating: 4.9,
    reviewCount: 56,
    featured: false
  },

  // MERCHANDISING
  {
    id: 'camiseta-pegote',
    name: 'Camiseta "Tigueraje" Edición Pegote',
    nameEn: 'Pegote Edition "Tigueraje" T-Shirt',
    description: 'Camiseta 100% algodón con logo bordado. Tallas S-XXL.',
    descriptionEn: '100% cotton t-shirt with embroidered logo. Sizes S-XXL.',
    price: 24.99,
    images: ['/images/products/camiseta-pegote.jpg'],
    category: 'merch',
    brand: 'Pegote Brand',
    inStock: true,
    stockQuantity: 50,
    rating: 4.8,
    reviewCount: 92,
    featured: true
  },
  {
    id: 'gorra-pegote',
    name: 'Gorra Snapback Pegote',
    nameEn: 'Pegote Snapback Cap',
    description: 'Gorra ajustable con bordado frontal. 100% algodón.',
    descriptionEn: 'Adjustable cap with front embroidery. 100% cotton.',
    price: 19.99,
    images: ['/images/products/gorra-pegote.jpg'],
    category: 'merch',
    brand: 'Pegote Brand',
    inStock: true,
    stockQuantity: 35,
    rating: 4.7,
    reviewCount: 78
  },
  {
    id: 'taza-barbero',
    name: 'Taza "El Mejor Barbero"',
    nameEn: '"Best Barber" Mug',
    description: 'Taza cerámica 11oz con diseño exclusivo Pegote.',
    descriptionEn: '11oz ceramic mug with exclusive Pegote design.',
    price: 12.99,
    images: ['/images/products/taza.jpg'],
    category: 'merch',
    brand: 'Pegote Brand',
    inStock: true,
    stockQuantity: 60,
    rating: 4.5,
    reviewCount: 34
  },
  {
    id: 'hoodie-pegote',
    name: 'Hoodie Premium Pegote',
    nameEn: 'Pegote Premium Hoodie',
    description: 'Sudadera con capucha. 80% algodón, 20% poliéster. Bordado grande.',
    descriptionEn: 'Hooded sweatshirt. 80% cotton, 20% polyester. Large embroidery.',
    price: 44.99,
    compareAtPrice: 54.99,
    images: ['/images/products/hoodie.jpg'],
    category: 'merch',
    brand: 'Pegote Brand',
    inStock: true,
    stockQuantity: 20,
    rating: 4.9,
    reviewCount: 67,
    featured: true
  }
];

// ============================================
// BUNDLES/COMBOS
// ============================================

export const pegoteBundles: Bundle[] = [
  {
    id: 'fade-fresh',
    name: 'Fade Fresh',
    nameEn: 'Fade Fresh',
    description: 'Corte Fade + Pomada Suavecito',
    descriptionEn: 'Fade Cut + Suavecito Pomade',
    items: [
      {
        type: 'service',
        id: 'corte-fade',
        name: 'Corte Fade',
        nameEn: 'Fade Cut',
        price: 30
      },
      {
        type: 'product',
        id: 'pomada-suavecito',
        name: 'Pomada Suavecito',
        nameEn: 'Suavecito Pomade',
        price: 12.99
      }
    ],
    regularPrice: 42.99,
    bundlePrice: 38.99,
    savings: 4.00,
    image: '/images/bundles/fade-fresh.jpg',
    popular: true,
    category: 'hair-care'
  },
  {
    id: 'barba-boss',
    name: 'Barba Boss',
    nameEn: 'Barba Boss',
    description: 'Perfilado Barba + Aceite + Bálsamo',
    descriptionEn: 'Beard Trim + Oil + Balm',
    items: [
      {
        type: 'service',
        id: 'barba-completa',
        name: 'Barba Completa',
        nameEn: 'Full Beard Service',
        price: 20
      },
      {
        type: 'product',
        id: 'aceite-barba-sandalwood',
        name: 'Aceite de Barba',
        nameEn: 'Beard Oil',
        price: 16.99
      },
      {
        type: 'product',
        id: 'balsamo-barba',
        name: 'Bálsamo de Barba',
        nameEn: 'Beard Balm',
        price: 13.99
      }
    ],
    regularPrice: 50.98,
    bundlePrice: 44.99,
    savings: 5.99,
    image: '/images/bundles/barba-boss.jpg',
    popular: true,
    category: 'beard-care'
  },
  {
    id: 'afro-king',
    name: 'Afro King',
    nameEn: 'Afro King',
    description: 'Corte Afro + Aceite Argán + Peine',
    descriptionEn: 'Afro Cut + Argan Oil + Comb',
    items: [
      {
        type: 'service',
        id: 'corte-afro',
        name: 'Corte Afro',
        nameEn: 'Afro Cut',
        price: 35
      },
      {
        type: 'product',
        id: 'aceite-argan',
        name: 'Aceite de Argán',
        nameEn: 'Argan Oil',
        price: 18.99
      },
      {
        type: 'product',
        id: 'peine-metal',
        name: 'Peine Pick',
        nameEn: 'Pick Comb',
        price: 8.99
      }
    ],
    regularPrice: 62.98,
    bundlePrice: 54.99,
    savings: 7.99,
    image: '/images/bundles/afro-king.jpg',
    category: 'hair-care'
  },
  {
    id: 'starter-kit',
    name: 'Starter Kit',
    nameEn: 'Starter Kit',
    description: 'Primer Corte + Pomada + Peine + Camiseta',
    descriptionEn: 'First Cut + Pomade + Comb + T-Shirt',
    items: [
      {
        type: 'service',
        id: 'corte-clasico',
        name: 'Corte Clásico',
        nameEn: 'Classic Cut',
        price: 25
      },
      {
        type: 'product',
        id: 'pomada-suavecito',
        name: 'Pomada',
        nameEn: 'Pomade',
        price: 12.99
      },
      {
        type: 'product',
        id: 'peine-metal',
        name: 'Peine',
        nameEn: 'Comb',
        price: 8.99
      },
      {
        type: 'product',
        id: 'camiseta-pegote',
        name: 'Camiseta Pegote',
        nameEn: 'Pegote T-Shirt',
        price: 24.99
      }
    ],
    regularPrice: 71.97,
    bundlePrice: 59.99,
    savings: 11.98,
    image: '/images/bundles/starter-kit.jpg',
    popular: false,
    category: 'bundles'
  }
];

// ============================================
// BEFORE/AFTER GALLERY
// ============================================

export const pegoteBeforeAfter: BeforeAfterImage[] = [
  {
    id: 'fade-1',
    before: '/images/pegote/before-after/fade-before-1.jpg',
    after: '/images/pegote/before-after/fade-after-1.jpg',
    category: 'fade',
    barberOrProvider: 'Pegote',
    date: new Date('2025-01-10'),
    description: 'Fade bajo con lineup perfecto',
    descriptionEn: 'Low fade with perfect lineup'
  },
  {
    id: 'fade-2',
    before: '/images/pegote/before-after/fade-before-2.jpg',
    after: '/images/pegote/before-after/fade-after-2.jpg',
    category: 'fade',
    barberOrProvider: 'Junior',
    date: new Date('2025-01-08'),
    description: 'Taper fade con diseño lateral',
    descriptionEn: 'Taper fade with side design'
  },
  {
    id: 'afro-1',
    before: '/images/pegote/before-after/afro-before-1.jpg',
    after: '/images/pegote/before-after/afro-after-1.jpg',
    category: 'afro',
    barberOrProvider: 'Pegote',
    date: new Date('2025-01-05'),
    description: 'Shape up afro con definición',
    descriptionEn: 'Afro shape up with definition'
  },
  {
    id: 'beard-1',
    before: '/images/pegote/before-after/beard-before-1.jpg',
    after: '/images/pegote/before-after/beard-after-1.jpg',
    category: 'beard',
    barberOrProvider: 'Junior',
    date: new Date('2025-01-03'),
    description: 'Perfilado de barba con navaja',
    descriptionEn: 'Beard lineup with straight razor'
  },
  {
    id: 'design-1',
    before: '/images/pegote/before-after/design-before-1.jpg',
    after: '/images/pegote/before-after/design-after-1.jpg',
    category: 'design',
    barberOrProvider: 'Junior',
    date: new Date('2024-12-28'),
    description: 'Diseño artístico en fade alto',
    descriptionEn: 'Artistic design on high fade'
  },
  {
    id: 'taper-1',
    before: '/images/pegote/before-after/taper-before-1.jpg',
    after: '/images/pegote/before-after/taper-after-1.jpg',
    category: 'taper',
    barberOrProvider: 'Pegote',
    date: new Date('2024-12-25'),
    description: 'Taper clásico con textura',
    descriptionEn: 'Classic taper with texture'
  }
];
