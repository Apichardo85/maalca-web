export interface MenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface MenuSection {
  desayunos: MenuItem[];
  almuerzos: MenuItem[];
  acompañantes: MenuItem[];
  bebidas: MenuItem[];
}

export const dominicanMenus: MenuSection = {
  desayunos: [
    {
      name: 'Mangú con Los Tres Golpes',
      price: 12,
      description: 'Plátano majado, salami frito, queso frito, huevos'
    },
    {
      name: 'Yaroa de Desayuno',
      price: 10,
      description: 'Plátano, salami, queso, huevos revueltos'
    },
    {
      name: 'Tostada con Aguacate',
      price: 8,
      description: 'Pan criollo, aguacate, huevo, tomate'
    }
  ],
  almuerzos: [
    {
      name: 'La Bandera Dominicana',
      price: 15,
      description: 'Arroz blanco, habichuelas guisadas, carne guisada, ensalada'
    },
    {
      name: 'Sancocho Dominicano',
      price: 18,
      description: '7 carnes, yuca, plátano, ñame, yautía'
    },
    {
      name: 'Moro de Guandules con Chuleta',
      price: 16,
      description: 'Arroz con guandules, chuleta frita, ensalada'
    },
    {
      name: 'Pollo Guisado',
      price: 14,
      description: 'Pollo criollo guisado, arroz blanco, habichuelas'
    },
    {
      name: 'Pescado Frito con Tostones',
      price: 20,
      description: 'Chillo frito, tostones, ensalada verde'
    }
  ],
  acompañantes: [
    { name: 'Tostones', price: 5 },
    { name: 'Yuca Frita', price: 5 },
    { name: 'Maduros Fritos', price: 4 },
    { name: 'Arroz Blanco', price: 3 },
    { name: 'Habichuelas Guisadas', price: 4 }
  ],
  bebidas: [
    {
      name: 'Morir Soñando',
      price: 6,
      description: 'Naranja, leche, azúcar, hielo'
    },
    { name: 'Jugo de Chinola', price: 5 },
    { name: 'Jugo de Lechosa', price: 5 },
    { name: 'Presidente (cerveza)', price: 4 }
  ]
};
