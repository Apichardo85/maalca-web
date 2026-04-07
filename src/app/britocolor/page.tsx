"use client";
import { Button } from "@/components/ui/buttons";
import {
  AffiliateServiceCard,
  AffiliateGallery,
  AffiliateTeamGrid,
  AffiliateTestimonials,
  AffiliateContactSection,
  type AffiliateService,
  type GalleryImage,
  type TeamMember,
  type Testimonial,
  type ContactInfo
} from "@/components/affiliate";
// Services data
const services: AffiliateService[] = [
  {
    id: "fachadas",
    name: "Fachadas Comerciales",
    nameEn: "Commercial Facades",
    description: "Diseño e instalación de fachadas completas con acabados profesionales",
    descriptionEn: "Design and installation of complete facades with professional finishes",
    icon: "🏢",
    popular: true
  },
  {
    id: "totems",
    name: "Totems y Señalética ACM",
    nameEn: "Totems and ACM Signage",
    description: "Fabricación de totems y señalética en ACM de alta calidad",
    descriptionEn: "Manufacturing of totems and high-quality ACM signage",
    icon: "🔶"
  },
  {
    id: "adhesivos",
    name: "Adhesivos y Menús",
    nameEn: "Stickers and Menus",
    description: "Adhesivos corporativos y menús personalizados para tu negocio",
    descriptionEn: "Corporate stickers and custom menus for your business",
    icon: "📋",
    popular: true
  },
  {
    id: "banners",
    name: "Banners Publicitarios",
    nameEn: "Advertising Banners",
    description: "Impresión de banners y lonas publicitarias de gran formato",
    descriptionEn: "Printing of large format advertising banners and canvases",
    icon: "🎯"
  },
  {
    id: "rotulacion",
    name: "Rotulación con Plotter",
    nameEn: "Plotter Lettering",
    description: "Rotulación profesional con plotter de corte de última generación",
    descriptionEn: "Professional lettering with state-of-the-art cutting plotter",
    icon: "✂️"
  },
  {
    id: "pintura",
    name: "Pintura para Madera",
    nameEn: "Wood Painting",
    description: "Colores personalizados y pintura artesanal especializada para madera",
    descriptionEn: "Custom colors and specialized artisan painting for wood",
    icon: "🎨",
    popular: true
  }
];
// Gallery data
const galleryImages: GalleryImage[] = [
  {
    src: "/images/britocolor/fachada-1.jpg",
    title: "Fachada Comercial Premium",
    titleEn: "Premium Commercial Facade",
    category: "Fachadas"
  },
  {
    src: "/images/britocolor/totem-1.jpg",
    title: "Totem ACM Iluminado",
    titleEn: "Illuminated ACM Totem",
    category: "Totems"
  },
  {
    src: "/images/britocolor/adhesivo-1.jpg",
    title: "Menú Personalizado",
    titleEn: "Custom Menu",
    category: "Adhesivos"
  },
  {
    src: "/images/britocolor/banner-1.jpg",
    title: "Banner Gran Formato",
    titleEn: "Large Format Banner",
    category: "Banners"
  },
  {
    src: "/images/britocolor/rotulo-1.jpg",
    title: "Rotulación Vehicular",
    titleEn: "Vehicle Lettering",
    category: "Rotulación"
  },
  {
    src: "/images/britocolor/madera-1.jpg",
    title: "Acabado en Madera",
    titleEn: "Wood Finish",
    category: "Pintura"
  }
];
// Team data
const team: TeamMember[] = [
  {
    id: "edvan-brito",
    name: "Edvan Brito",
    role: "Fundador y Director Creativo",
    roleEn: "Founder and Creative Director",
    bio: "Más de 15 años transformando espacios comerciales con color y diseño. Especialista en comunicación visual y acabados personalizados.",
    bioEn: "Over 15 years transforming commercial spaces with color and design. Specialist in visual communication and custom finishes.",
    experience: "15+ años",
    icon: "👨‍🎨",
    available: true,
    specialties: ["Diseño de fachadas", "Pintura artesanal", "Comunicación visual"]
  }
];
// Testimonials data
const testimonials: Testimonial[] = [
  {
    name: "Carlos Fernández",
    location: "Santo Domingo Este",
    text: "BritoColor transformó completamente la fachada de mi negocio. El trabajo de Edvan es impecable y muy profesional.",
    textEn: "BritoColor completely transformed my business facade. Edvan's work is impeccable and very professional.",
    rating: 5,
    service: "Fachada Comercial"
  },
  {
    name: "María González",
    location: "Distrito Nacional",
    text: "Los adhesivos y menús que diseñaron superaron todas mis expectativas. Calidad excepcional y entrega a tiempo.",
    textEn: "The stickers and menus they designed exceeded all my expectations. Exceptional quality and on-time delivery.",
    rating: 5,
    service: "Adhesivos Personalizados"
  },
  {
    name: "Roberto Díaz",
    location: "Santo Domingo",
    text: "Trabajo artesanal de primera. La pintura en madera quedó perfecta. Muy recomendado.",
    textEn: "First-class artisan work. The wood painting was perfect. Highly recommended.",
    rating: 5,
    service: "Pintura para Madera"
  }
];
// Contact info
const contactInfo: ContactInfo = {
  name: "BritoColor",
  phone: "+1 829 996 8601",
  email: "contacto@britocolor.com",
  address: "Santo Domingo Este",
  city: "Santo Domingo",
  country: "República Dominicana",
  whatsapp: "+18299968601",
  socialMedia: {
    instagram: "https://www.instagram.com/britocolor"
  }
};
export default function BritoColorPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #8B5CF6 0px,
                #8B5CF6 20px,
                transparent 20px,
                transparent 40px
              )`,
            }}
          />
        </div>
        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="animate-fade-in-up">
            {/* Logo/Icon */}
            <div className="mb-8 animate-pulse-slow">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <span className="text-6xl">🎨</span>
              </div>
            </div>
            <h1
              className="text-7xl md:text-9xl font-black mb-6 leading-tight text-white drop-shadow-2xl animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              BritoColor
            </h1>
            <h2
              className="text-3xl md:text-5xl font-bold mb-8 text-pink-300 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              Donde el color se convierte en arte
            </h2>
            <p
              className="text-xl md:text-2xl text-white/90 mb-4 font-medium max-w-3xl mx-auto animate-fade-in"
              style={{ animationDelay: '0.9s' }}
            >
              Comunicación visual, impresión digital y pintura artesanal para madera
            </p>
            <p
              className="text-lg text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '1.1s' }}
            >
              Transformamos espacios comerciales con diseño, color y acabados personalizados de alta calidad
            </p>
            <div
              className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up"
              style={{ animationDelay: '1.4s' }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-black px-12 py-5 text-xl border-0 shadow-lg transform hover:scale-105 transition-all"
              >
                🎨 Ver Servicios
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-3 border-white text-white hover:bg-white hover:text-purple-900 font-bold px-12 py-5 text-xl backdrop-blur-sm"
                onClick={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
              >
                📸 Ver Galería
              </Button>
            </div>
            {/* Quick Stats */}
            <div
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: '1.8s' }}
            >
              {[
                { value: "15+", label: "Años de Experiencia" },
                { value: "500+", label: "Proyectos Completados" },
                { value: "100%", label: "Satisfacción Garantizada" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce-slow"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-medium">Descubrir</span>
            <div className="w-0.5 h-16 bg-gradient-to-b from-white to-transparent rounded-full"></div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-6xl font-black text-gray-900 mb-6">SERVICIOS</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones integrales de comunicación visual y diseño para tu negocio
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AffiliateServiceCard
                key={service.id}
                service={service}
                index={index}
                variant="design"
                onBook={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Gallery Section */}
      <div id="galeria">
        <AffiliateGallery
          images={galleryImages}
          title="Nuestros Trabajos"
          titleEn="Our Work"
          columns={3}
        />
      </div>
      {/* Team Section */}
      <AffiliateTeamGrid
        members={team}
        variant="design"
        onBookWithMember={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
      />
      {/* Testimonials Section */}
      <AffiliateTestimonials testimonials={testimonials} />
      {/* About Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900 to-pink-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl font-black mb-6">NUESTRA HISTORIA</h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  BritoColor nació del amor por el diseño y la pasión por transformar espacios comerciales.
                  Con más de 15 años de experiencia, hemos llevado color y vida a cientos de negocios en
                  República Dominicana.
                </p>
                <p>
                  Nos especializamos en comunicación visual, desde la conceptualización hasta la instalación,
                  ofreciendo soluciones integrales que reflejan la identidad única de cada cliente.
                </p>
                <p>
                  Cada proyecto es una obra de arte, cuidadosamente elaborada con técnicas artesanales y
                  tecnología moderna. Creemos que el color tiene el poder de transformar no solo espacios,
                  sino también experiencias.
                </p>
              </div>
            </div>
            <div className="text-center animate-fade-in-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-8xl mb-6">🎨</div>
                <h3 className="text-3xl font-bold mb-4">Más que Diseño</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>Experiencia:</span>
                    <span className="font-bold">15+ años</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>Proyectos:</span>
                    <span className="font-bold">500+</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>Clientes Satisfechos:</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Calidad:</span>
                    <span className="font-bold">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <AffiliateContactSection
        contactInfo={contactInfo}
        variant="design"
      />
      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-4xl">🎨</div>
            <div>
              <div className="text-2xl font-black">BritoColor</div>
              <div className="text-sm text-pink-300 font-medium">
                Donde el color se convierte en arte
              </div>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
            Transformando espacios comerciales con diseño, color y acabados personalizados
            desde Santo Domingo, República Dominicana.
          </p>
          <div className="text-gray-500 text-sm mb-6">
            <p className="mb-2">🇩🇴 Orgullosamente Dominicano</p>
            <p>🎨 Parte del ecosistema MaalCa</p>
          </div>
          <div className="pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-2">
              © 2024 BritoColor - Parte del ecosistema MaalCa
            </p>
            <p className="text-gray-600 text-xs italic">
              {`"El color tiene el poder de transformar"`}
            </p>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in-scale" style={{ animationDelay: '3s', animationFillMode: 'backwards' }}>
        <a
          href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300"
        >
          💬
        </a>
      </div>
    </main>
  );
}
