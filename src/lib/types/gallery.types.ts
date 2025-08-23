export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: GalleryCategory;
  imageUrl: string;
  thumbnailUrl?: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: number;
  tags?: string[];
  createdAt?: Date;
}

export type GalleryCategory = 
  | "box-comida"
  | "bubette" 
  | "empanadas"
  | "eventos-corporativos"
  | "bodas"
  | "celebraciones"
  | "postres"
  | "todas";

export interface CategoryFilter {
  value: GalleryCategory;
  label: string;
  count?: number;
  color?: string;
}

export interface GalleryState {
  selectedCategory: GalleryCategory;
  selectedItem: GalleryItem | null;
  isLightboxOpen: boolean;
  searchTerm: string;
}

export interface GalleryProps {
  items: GalleryItem[];
  categories?: CategoryFilter[];
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  columns?: number;
  gap?: number;
  onItemClick?: (item: GalleryItem) => void;
  className?: string;
}