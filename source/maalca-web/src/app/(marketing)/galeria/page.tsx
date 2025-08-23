"use client";

import { ProductGallery } from "@/components/sections";
import { GalleryItem } from "@/lib/types";

export default function GaleriaPage() {
  const handleItemClick = (item: GalleryItem) => {
    console.log("Item clicked:", item);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Nuestra Galería
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explora nuestras creaciones gastronómicas más destacadas y descubre la excelencia 
              que caracteriza cada uno de nuestros servicios de catering
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGallery
            items={[]} // Will use default sample items
            onItemClick={handleItemClick}
            showSearch={true}
            showCategoryFilter={true}
            columns={3}
            className="w-full"
          />
        </div>
      </section>
    </main>
  );
}