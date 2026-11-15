// Catálogo de provincias y municipios de Alanube/DGII (formato PPMMDD, 6 dígitos).
// Provincia = PP0000, municipio = PPMM00. Fuente: developer.alanube.co → Catálogo de provincias y municipios.

export const FISCAL_PROVINCES: ReadonlyArray<readonly [string, string]> = [
  ['010000', 'Distrito Nacional'], ['020000', 'Azua'], ['030000', 'Bahoruco'], ['040000', 'Barahona'],
  ['050000', 'Dajabón'], ['060000', 'Duarte'], ['070000', 'Elías Piña'], ['080000', 'El Seibo'],
  ['090000', 'Espaillat'], ['100000', 'Independencia'], ['110000', 'La Altagracia'], ['120000', 'La Romana'],
  ['130000', 'La Vega'], ['140000', 'María Trinidad Sánchez'], ['150000', 'Monte Cristi'], ['160000', 'Pedernales'],
  ['170000', 'Peravia'], ['180000', 'Puerto Plata'], ['190000', 'Hermanas Mirabal'], ['200000', 'Samaná'],
  ['210000', 'San Cristóbal'], ['220000', 'San Juan'], ['230000', 'San Pedro de Macorís'], ['240000', 'Sánchez Ramírez'],
  ['250000', 'Santiago'], ['260000', 'Santiago Rodríguez'], ['270000', 'Valverde'], ['280000', 'Monseñor Nouel'],
  ['290000', 'Monte Plata'], ['300000', 'Hato Mayor'], ['310000', 'San José de Ocoa'], ['320000', 'Santo Domingo'],
];

export const FISCAL_MUNICIPALITIES: ReadonlyArray<readonly [string, string]> = [
  ['010100', 'Santo Domingo de Guzmán'],
  ['020100', 'Azua'], ['020200', 'Las Charcas'], ['020300', 'Las Yayas de Viajama'], ['020400', 'Padre Las Casas'],
  ['020500', 'Peralta'], ['020600', 'Sabana Yegua'], ['020700', 'Pueblo Viejo'], ['020800', 'Tábara Arriba'],
  ['020900', 'Guayabal'], ['021000', 'Estebanía'],
  // Neiba figura como 030001 en el catálogo publicado (no 030100); verificar contra Alanube en sandbox.
  ['030001', 'Neiba'], ['030200', 'Galván'], ['030300', 'Tamayo'], ['030400', 'Villa Jaragua'], ['030500', 'Los Ríos'],
  ['040100', 'Barahona'], ['040200', 'Cabral'], ['040300', 'Enriquillo'], ['040400', 'Paraíso'], ['040500', 'Vicente Noble'],
  ['040600', 'El Peñón'], ['040700', 'La Ciénaga'], ['040800', 'Fundación'], ['040900', 'Las Salinas'],
  ['041000', 'Polo'], ['041100', 'Jaquimeyes'],
  ['050100', 'Dajabón'], ['050200', 'Loma de Cabrera'], ['050300', 'Partido'], ['050400', 'Restauración'], ['050500', 'El Pino'],
  ['060100', 'San Francisco de Macorís'], ['060200', 'Arenoso'], ['060300', 'Castillo'], ['060400', 'Pimentel'],
  ['060500', 'Villa Riva'], ['060600', 'Las Guáranas'], ['060700', 'Eugenio María de Hostos'],
  ['070100', 'Comendador'], ['070200', 'Bánica'], ['070300', 'El Llano'], ['070400', 'Hondo Valle'],
  ['070500', 'Pedro Santana'], ['070600', 'Juan Santiago'],
  ['080100', 'El Seibo'], ['080200', 'Miches'],
  ['090100', 'Moca'], ['090200', 'Cayetano Germosén'], ['090300', 'Gaspar Hernández'], ['090400', 'Jamao al Norte'],
  ['100100', 'Jimaní'], ['100200', 'Duvergé'], ['100300', 'La Descubierta'], ['100400', 'Postrer Río'],
  ['100500', 'Cristóbal'], ['100600', 'Mella'],
  ['110100', 'Higüey'], ['110200', 'San Rafael del Yuma'],
  ['120100', 'La Romana'], ['120200', 'Guaymate'], ['120300', 'Villa Hermosa'],
  ['130100', 'La Vega'], ['130200', 'Constanza'], ['130300', 'Jarabacoa'], ['130400', 'Jima Abajo'],
  ['140100', 'Nagua'], ['140200', 'Cabrera'], ['140300', 'El Factor'], ['140400', 'Río San Juan'],
  ['150100', 'Monte Cristi'], ['150200', 'Castañuelas'], ['150300', 'Guayubín'], ['150400', 'Las Matas de Santa Cruz'],
  ['150500', 'Pepillo Salcedo'], ['150600', 'Villa Vásquez'],
  ['160100', 'Pedernales'], ['160200', 'Oviedo'],
  ['170100', 'Baní'], ['170200', 'Nizao'], ['170300', 'Matanzas'],
  ['180100', 'Puerto Plata'], ['180200', 'Altamira'], ['180300', 'Guananico'], ['180400', 'Imbert'],
  ['180500', 'Los Hidalgos'], ['180600', 'Luperón'], ['180700', 'Sosúa'], ['180800', 'Villa Isabela'], ['180900', 'Villa Montellano'],
  ['190100', 'Salcedo'], ['190200', 'Tenares'], ['190300', 'Villa Tapia'],
  ['200100', 'Samaná'], ['200200', 'Sánchez'], ['200300', 'Las Terrenas'],
  ['210100', 'San Cristóbal'], ['210200', 'Sabana Grande de Palenque'], ['210300', 'Bajos de Haina'],
  ['210400', 'Cambita Garabitos'], ['210500', 'Villa Altagracia'], ['210600', 'Yaguate'],
  ['210700', 'San Gregorio de Nigua'], ['210800', 'Los Cacaos'],
  ['220100', 'San Juan'], ['220200', 'Bohechío'], ['220300', 'El Cercado'], ['220400', 'Juan de Herrera'],
  ['220500', 'Las Matas de Farfán'], ['220600', 'Vallejuelo'],
  ['230100', 'San Pedro de Macorís'], ['230200', 'Los Llanos'], ['230300', 'Ramón Santana'], ['230400', 'Consuelo'],
  ['230500', 'Quisqueya'], ['230600', 'Guayacanes'],
  ['240100', 'Cotuí'], ['240200', 'Cevicos'], ['240300', 'Fantino'], ['240400', 'La Mata'],
  ['250100', 'Santiago'], ['250200', 'Bisonó'], ['250300', 'Jánico'], ['250400', 'Licey al Medio'],
  ['250500', 'San José de las Matas'], ['250600', 'Tamboril'], ['250700', 'Villa González'], ['250800', 'Puñal'],
  ['250900', 'Sabana Iglesia'], ['251000', 'Baitoa'],
  ['260100', 'San Ignacio de Sabaneta'], ['260200', 'Villa Los Almácigos'], ['260300', 'Monción'],
  ['270100', 'Mao'], ['270200', 'Esperanza'], ['270300', 'Laguna Salada'],
  ['280100', 'Bonao'], ['280200', 'Maimón'], ['280300', 'Piedra Blanca'],
  ['290100', 'Monte Plata'], ['290200', 'Bayaguana'], ['290300', 'Sabana Grande de Boyá'], ['290400', 'Yamasá'], ['290500', 'Peralvillo'],
  ['300100', 'Hato Mayor'], ['300200', 'Sabana de la Mar'], ['300300', 'El Valle'],
  ['310100', 'San José de Ocoa'], ['310200', 'Sabana Larga'], ['310300', 'Rancho Arriba'],
  ['320100', 'Santo Domingo Este'], ['320200', 'Santo Domingo Oeste'], ['320300', 'Santo Domingo Norte'],
  ['320400', 'Boca Chica'], ['320500', 'San Antonio de Guerra'], ['320600', 'Los Alcarrizos'], ['320700', 'Pedro Brand'],
];

/** Municipios de una provincia (código PP0000). */
export function municipalitiesOf(provinceCode: string): Array<readonly [string, string]> {
  const pp = provinceCode.slice(0, 2);
  return FISCAL_MUNICIPALITIES.filter(([code]) => code.startsWith(pp));
}
