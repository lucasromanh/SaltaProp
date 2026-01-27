
export enum PropertyType {
  APARTMENT = 'Departamento',
  HOUSE = 'Casa',
  LAND = 'Terreno',
  COMMERCIAL = 'Local Comercial',
  OFFICE = 'Oficina'
}

export enum TransactionType {
  BUY = 'Compra',
  RENT = 'Alquiler',
  TEMPORARY = 'Temporal',
  TRANSFER = 'Traspaso',
  PROJECTS = 'PROYECTOS'
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'ARS' | 'S/';
  maintenancePrice?: number;
  type: PropertyType;
  transaction: TransactionType;
  address: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  images: string[];
  videoUrl?: string;
  panoramicUrl?: string;
  coordinates: [number, number];
  featured: boolean;
  amenities: string[];
  age?: number;
  isPrivateBarrio?: boolean;
  publicationDate?: Date;
  advertiserType?: 'Inmobiliaria' | 'Dueño directo';
}

export interface FilterState {
  type: PropertyType | '';
  transaction: TransactionType | string;
  city: string;
  search: string;
  isPrivateBarrio: boolean;
  vallesOnly: boolean;
  surfaceType: 'Techada' | 'Total';
  surfaceMin: string;
  surfaceMax: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  advertiserType: string;
  age: string;
  pubDate: string;
  selectedAmenities: string[];
  multimedia: string[];
  address: string;
}

export interface CurrencyRates {
  blue: number;
  official: number;
  lastUpdate: string;
}
