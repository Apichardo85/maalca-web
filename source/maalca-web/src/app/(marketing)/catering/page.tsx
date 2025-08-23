"use client";

import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

export default function CateringPage() {
  return (
    <main className="min-h-screen">
      <HeroSection
        title="Catering de Lujo"
        subtitle="MaalCa Premium Services"
        description="Transformamos cada evento en una experiencia gastronómica única. Sabores excepcionales que crean momentos inolvidables."
        variant="gold"
        ctaText="Solicitar Cotización"
        ctaAction={() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      
      <ServicesSection />
      
      <TestimonialsSection />
      
      <CTASection />
    </main>
  );
}