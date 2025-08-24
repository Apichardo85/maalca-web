"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const products = [
  {
    id: "emerald-reserve",
    name: "Emerald Reserve",
    category: "Flores Artesanales",
    type: "Hybrid Premium",
    description: "Una experiencia sensorial única. Cultivado artesanalmente con técnicas ancestrales y cuidado moderno.",
    thc: "24-28%",
    cbd: "0.8-1.2%",
    price: 85,
    unit: "3.5g",
    image: "/images/verde-prive/emerald-reserve.jpg",
    exclusive: true,
    inStock: true,
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    effects: ["Relaxation", "Creativity", "Focus"],
    limitedEdition: false
  },
  {
    id: "golden-hash",
    name: "Golden Hash Artesanal",
    category: "Extractos Premium",
    type: "Traditional Hash",
    description: "Hash tradicional elaborado con técnicas centenarias. Una experiencia de contemplación pura.",
    thc: "45-50%",
    cbd: "2-4%",
    price: 120,
    unit: "2g",
    image: "/images/verde-prive/golden-hash.jpg",
    exclusive: true,
    inStock: true,
    terpenes: ["Pinene", "Linalool", "Humulene"],
    effects: ["Deep Relaxation", "Meditation", "Introspection"],
    limitedEdition: true
  },
  {
    id: "midnight-oil",
    name: "Midnight Oil",
    category: "Aceites & Tinturas",
    type: "Full Spectrum Oil",
    description: "Aceite de espectro completo para momentos de reflexión nocturna. Pureza y potencia en cada gota.",
    thc: "1000mg",
    cbd: "200mg",
    price: 95,
    unit: "30ml",
    image: "/images/verde-prive/midnight-oil.jpg",
    exclusive: false,
    inStock: true,
    terpenes: ["Myrcene", "Linalool", "Terpinolene"],
    effects: ["Sleep Aid", "Stress Relief", "Body Relaxation"],
    limitedEdition: false
  },
  {
    id: "luxury-grinder",
    name: "Grinder Edición Privé",
    category: "Accesorios de Lujo",
    type: "Luxury Accessory",
    description: "Grinder artesanal en acero inoxidable con detalles en oro. Funcionalidad y elegancia.",
    thc: "N/A",
    cbd: "N/A",
    price: 180,
    unit: "piece",
    image: "/images/verde-prive/luxury-grinder.jpg",
    exclusive: true,
    inStock: true,
    terpenes: [],
    effects: [],
    limitedEdition: false
  },
  {
    id: "ritual-kit",
    name: "Kit Ritual Completo",
    category: "Sets Exclusivos",
    type: "Complete Experience",
    description: "Todo lo necesario para una sesión perfecta. Incluye flores, aceite, accesorios y guía de ritual.",
    thc: "Varies",
    cbd: "Varies",
    price: 280,
    unit: "kit",
    image: "/images/verde-prive/ritual-kit.jpg",
    exclusive: true,
    inStock: false,
    terpenes: ["Multi-profile"],
    effects: ["Complete Experience", "Mindfulness", "Luxury"],
    limitedEdition: true
  },
  {
    id: "private-blend",
    name: "Blend Privado del Mes",
    category: "Ediciones Limitadas",
    type: "Monthly Exclusive",
    description: "Mezcla exclusiva disponible solo para miembros del club. Cambia cada mes, siempre excepcional.",
    thc: "20-30%",
    cbd: "1-3%",
    price: 65,
    unit: "2.5g",
    image: "/images/verde-prive/private-blend.jpg",
    exclusive: true,
    inStock: true,
    terpenes: ["Rotating Profile"],
    effects: ["Surprise", "Discovery", "Exclusivity"],
    limitedEdition: true
  }
];

const membershipTiers = [
  {
    id: "classic",
    name: "Classic",
    price: 89,
    frequency: "mensual",
    description: "Para el entusiasta que aprecia la calidad artesanal",
    benefits: [
      "1 producto premium mensual",
      "Acceso al catálogo exclusivo", 
      "Entrega discreta garantizada",
      "Newsletter con contenido exclusivo"
    ],
    popular: false,
    color: "emerald"
  },
  {
    id: "gold",
    name: "Gold",
    price: 189,
    frequency: "mensual", 
    description: "La experiencia completa para el conocedor",
    benefits: [
      "2-3 productos premium mensuales",
      "Acceso prioritario a ediciones limitadas",
      "Consultas privadas con especialistas",
      "Eventos exclusivos virtuales",
      "Guías de ritual y maridaje"
    ],
    popular: true,
    color: "amber"
  },
  {
    id: "black-label",
    name: "Black Label",
    price: 389,
    frequency: "mensual",
    description: "Exclusividad absoluta para los verdaderos conocedores",
    benefits: [
      "Colección completa mensual (4-6 productos)",
      "Acceso VIP a productos únicos",
      "Concierge personalizado 24/7",
      "Experiencias privadas presenciales",
      "Productos personalizados a medida",
      "Acceso al salón privé virtual"
    ],
    popular: false,
    color: "slate"
  }
];

const lifestyleContent = [
  {
    id: "mindful-evening",
    title: "El Arte de la Velada Consciente",
    description: "Cómo crear el ambiente perfecto para una experiencia elevada",
    image: "/images/verde-prive/lifestyle-evening.jpg",
    category: "Lifestyle"
  },
  {
    id: "cannabis-wine",
    title: "Maridaje: Cannabis & Vino",
    description: "Explorando las sutilezas de combinar terpenos y taninos",
    image: "/images/verde-prive/lifestyle-wine.jpg", 
    category: "Cultura"
  },
  {
    id: "meditation-ritual",
    title: "Rituales de Meditación Moderna",
    description: "Integrando cannabis en prácticas contemplativas",
    image: "/images/verde-prive/lifestyle-meditation.jpg",
    category: "Wellness"
  }
];

export default function VerdePrivePage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [smokeAnimation, setSmokeAnimation] = useState(0);

  const categories = ["Todos", "Flores Artesanales", "Extractos Premium", "Aceites & Tinturas", "Accesorios de Lujo", "Sets Exclusivos", "Ediciones Limitadas"];

  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Smoke animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSmokeAnimation(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with subtle smoke animation */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-emerald-950/90 via-stone-900/95 to-black relative">
            {/* Floating smoke particles */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 bg-gradient-radial from-emerald-400/30 to-transparent rounded-full"
                  animate={{
                    x: [Math.random() * 100, Math.random() * 100 + 50],
                    y: [Math.random() * 100, Math.random() * 100 - 30],
                    scale: [0.5, 1, 0.3],
                    opacity: [0.1, 0.3, 0],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    delay: i * 1.5,
                  }}
                  style={{
                    left: `${10 + i * 20}%`,
                    top: `${20 + i * 15}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>


        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            {/* Premium Logo/Symbol */}
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-4 border-amber-400/30 shadow-2xl">
                <span className="text-4xl">🌿</span>
              </div>
            </motion.div>

            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light mb-8 leading-tight">
              <span className="text-emerald-300">Verde</span>
              <br />
              <span className="text-amber-400">Privé</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl font-light mb-4 text-stone-300 max-w-3xl mx-auto italic"
            >
              Cannabis premium con privacidad absoluta
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-lg text-stone-400 mb-12 max-w-2xl mx-auto"
            >
              Para adultos conscientes que buscan calidad artesanal, discreción total y un estilo de vida elevado
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-serif px-8 py-4 text-lg border border-amber-400/30"
              >
                Explorar Colección
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowMembershipModal(true)}
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-stone-900 font-serif px-8 py-4 text-lg"
              >
                Unirse al Club
              </Button>
            </motion.div>

            {/* Discrete age verification */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="text-xs text-stone-500 mt-12"
            >
              Solo para mayores de 21 años • Consumo responsable y consciente
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-emerald-400"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-serif">Descubrir</span>
            <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-400 to-transparent rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-serif text-emerald-300">
              Verde <span className="text-amber-400">Privé</span>
            </span>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#collection" className="text-stone-300 hover:text-emerald-400 transition-colors text-sm">
                Colección
              </a>
              <a href="#lifestyle" className="text-stone-300 hover:text-emerald-400 transition-colors text-sm">
                Lifestyle
              </a>
              <a href="#club" className="text-stone-300 hover:text-emerald-400 transition-colors text-sm">
                Club Privé
              </a>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 rounded-lg transition-colors text-sm"
              >
                Acceso Miembro
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Collection Section */}
      <section id="collection" className="py-24 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-light text-emerald-300 mb-6">
              Colección Exclusiva
            </h2>
            <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-8">
              Cada producto es una obra de arte. Cultivado, extraído y curado con técnicas artesanales 
              para ofrecer experiencias únicas a conocedores exigentes.
            </p>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-serif transition-all ${
                    selectedCategory === category
                      ? 'bg-emerald-700 text-emerald-100 border border-amber-400/50'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product.id)}
              >
                <div className="bg-stone-800 rounded-3xl overflow-hidden border border-stone-700 hover:border-emerald-600/50 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-stone-800 flex items-center justify-center">
                      <span className="text-6xl opacity-70">
                        {product.category === "Flores Artesanales" ? "🌿" :
                         product.category === "Extractos Premium" ? "🍯" :
                         product.category === "Aceites & Tinturas" ? "💧" :
                         product.category === "Accesorios de Lujo" ? "✨" :
                         product.category === "Sets Exclusivos" ? "🎁" : "🌙"}
                      </span>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.exclusive && (
                        <span className="bg-amber-400 text-stone-900 px-3 py-1 rounded-full text-xs font-bold">
                          Exclusivo
                        </span>
                      )}
                      {product.limitedEdition && (
                        <span className="bg-emerald-600 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                          Edición Limitada
                        </span>
                      )}
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.inStock 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {product.inStock ? "Disponible" : "Agotado"}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <div className="text-center text-emerald-300">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="font-serif text-lg">Ver Detalles</p>
                      </div>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-8">
                    <div className="mb-4">
                      <h3 className="font-serif text-2xl font-semibold text-emerald-300 mb-2 group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-stone-400 text-sm mb-1">{product.category}</p>
                      <p className="text-stone-500 text-xs font-medium">{product.type}</p>
                    </div>

                    <p className="text-stone-400 leading-relaxed mb-6 text-sm">
                      {product.description}
                    </p>

                    {/* Product Details */}
                    {(product.thc !== "N/A" || product.cbd !== "N/A") && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {product.thc !== "N/A" && (
                          <div className="text-center p-3 bg-stone-900 rounded-lg">
                            <div className="text-lg font-bold text-emerald-400">{product.thc}</div>
                            <div className="text-xs text-stone-500">THC</div>
                          </div>
                        )}
                        {product.cbd !== "N/A" && (
                          <div className="text-center p-3 bg-stone-900 rounded-lg">
                            <div className="text-lg font-bold text-amber-400">{product.cbd}</div>
                            <div className="text-xs text-stone-500">CBD</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Effects */}
                    {product.effects.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {product.effects.slice(0, 3).map((effect) => (
                            <span
                              key={effect}
                              className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-full border border-emerald-800"
                            >
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-light text-amber-400">${product.price}</div>
                        <div className="text-stone-500 text-sm">{product.unit}</div>
                      </div>
                      
                      <Button
                        variant="outline"
                        disabled={!product.inStock}
                        className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-emerald-100 disabled:opacity-50"
                      >
                        {product.inStock ? "Ver Más" : "Agotado"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Members Only Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-stone-800 to-emerald-900/20 rounded-3xl p-8 border border-amber-400/20">
              <h3 className="font-serif text-2xl text-amber-400 mb-4">Acceso Exclusivo</h3>
              <p className="text-stone-300 mb-6 max-w-2xl mx-auto">
                Algunos productos están disponibles únicamente para miembros del Club Verde Privé. 
                Únete para acceder a nuestra colección completa y experiencias exclusivas.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowMembershipModal(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-stone-900 font-serif"
              >
                Convertirse en Miembro
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section id="lifestyle" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-light text-emerald-300 mb-6">
              Lifestyle Consciente
            </h2>
            <p className="text-xl text-stone-400 max-w-3xl mx-auto">
              Cannabis como parte de un estilo de vida sofisticado, consciente y elevado. 
              Exploramos el arte de vivir con intención.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {lifestyleContent.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
              >
                <article className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 hover:border-emerald-700/50 transition-all duration-500">
                  {/* Article Image */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-800/30 to-stone-800 flex items-center justify-center">
                      <span className="text-6xl opacity-70">
                        {content.category === "Lifestyle" ? "🕯️" :
                         content.category === "Cultura" ? "🍷" : "🧘‍♀️"}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-stone-800/80 text-stone-300 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {content.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="font-serif text-xl font-semibold text-emerald-300 mb-3 group-hover:text-amber-400 transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-stone-400 leading-relaxed mb-6">
                      {content.description}
                    </p>
                    <div className="flex items-center text-emerald-400 text-sm font-medium">
                      <span className="mr-2">Leer más</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Club Privé Section */}
      <section id="club" className="py-24 bg-stone-900">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-light text-emerald-300 mb-6">
              Club Verde Privé
            </h2>
            <p className="text-xl text-stone-400 max-w-3xl mx-auto">
              Membresía exclusiva para conocedores que buscan lo excepcional. 
              Accede a productos únicos, experiencias privadas y un servicio sin igual.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative group ${tier.popular ? 'scale-105' : ''}`}
              >
                <div className={`bg-stone-800 rounded-3xl p-8 border-2 transition-all duration-500 ${
                  tier.popular 
                    ? 'border-amber-400 shadow-2xl shadow-amber-400/20' 
                    : 'border-stone-700 hover:border-emerald-600/50'
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-amber-400 text-stone-900 px-6 py-2 rounded-full text-sm font-bold">
                        Más Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-serif text-3xl font-light text-emerald-300 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-stone-400 mb-6">
                      {tier.description}
                    </p>
                    <div className="text-5xl font-light text-amber-400 mb-2">
                      ${tier.price}
                    </div>
                    <div className="text-stone-500 text-sm">
                      {tier.frequency}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-emerald-400 mt-1 flex-shrink-0">✓</span>
                        <span className="text-stone-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? "primary" : "outline"}
                    className={`w-full font-serif ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-stone-900' 
                        : 'border-2 border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-emerald-100'
                    }`}
                    onClick={() => setShowMembershipModal(true)}
                  >
                    Seleccionar {tier.name}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Exclusive Promise */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-emerald-900/30 to-stone-800 rounded-3xl p-8 border border-emerald-800/50">
              <h3 className="font-serif text-2xl text-emerald-300 mb-4">Privacidad Garantizada</h3>
              <p className="text-stone-400 max-w-2xl mx-auto leading-relaxed">
                Todos los envíos son completamente discretos, sin marcas identificatorias. 
                Tu privacidad es nuestra prioridad absoluta. Entrega en envases elegantes y neutros.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact/Join Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-5xl md:text-6xl font-light text-emerald-300 mb-6">
              ¿Listo para Elevarte?
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-12">
              Únete a una comunidad exclusiva de conocedores que valoran la calidad, 
              la privacidad y las experiencias excepcionales.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Join Club */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-stone-900 rounded-3xl p-8 border border-emerald-800/50"
              >
                <div className="text-5xl mb-6">🌿</div>
                <h3 className="font-serif text-2xl text-emerald-300 mb-4">
                  Unirse al Club
                </h3>
                <p className="text-stone-400 mb-6">
                  Acceso inmediato a productos exclusivos y experiencias únicas
                </p>
                <Button
                  variant="primary"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-serif"
                  onClick={() => setShowMembershipModal(true)}
                >
                  Convertirse en Miembro
                </Button>
              </motion.div>

              {/* Contact */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-stone-900 rounded-3xl p-8 border border-amber-800/50"
              >
                <div className="text-5xl mb-6">💬</div>
                <h3 className="font-serif text-2xl text-amber-400 mb-4">
                  Consulta Privada
                </h3>
                <p className="text-stone-400 mb-6">
                  Habla con nuestros especialistas de forma completamente confidencial
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-stone-900 font-serif"
                >
                  Consulta Discreta
                </Button>
              </motion.div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-stone-800 to-emerald-900/20 rounded-3xl p-8 border border-stone-700">
              <h3 className="font-serif text-2xl text-emerald-300 mb-4">
                Contenido Exclusivo
              </h3>
              <p className="text-stone-400 mb-6">
                Recibe insights sobre cannabis de calidad, rituales conscientes y lanzamientos exclusivos
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 bg-stone-900 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300"
                />
                <Button
                  variant="primary"
                  className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 px-6"
                >
                  Suscribirse
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-stone-950 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="font-serif text-3xl text-emerald-300 mb-4">
                Verde <span className="text-amber-400">Privé</span>
              </h3>
              <p className="text-stone-400 leading-relaxed max-w-md mb-6">
                Cannabis premium para conocedores exigentes. Privacidad, calidad y experiencias elevadas.
              </p>
              <div className="text-stone-500 text-sm">
                <p className="mb-2">🔞 Solo para mayores de 21 años</p>
                <p>🌿 Consumo responsable y consciente</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-emerald-300 mb-4">Enlaces</h4>
              <div className="space-y-2 text-stone-400 text-sm">
                <a href="#collection" className="block hover:text-emerald-400 transition-colors">Colección</a>
                <a href="#lifestyle" className="block hover:text-emerald-400 transition-colors">Lifestyle</a>
                <a href="#club" className="block hover:text-emerald-400 transition-colors">Club Privé</a>
                <a href="#" className="block hover:text-emerald-400 transition-colors">Términos</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-emerald-300 mb-4">Contacto Discreto</h4>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center gap-2 text-stone-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  <span>💬</span>
                  <span>WhatsApp Privado</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-stone-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  <span>📧</span>
                  <span>Email Cifrado</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-stone-800">
            <p className="text-stone-500 text-sm mb-2">
              © 2024 Verde Privé - Parte del ecosistema MaalCa
            </p>
            <p className="text-stone-600 text-xs italic font-serif">
              "Para pocos, para siempre"
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowLoginModal(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-stone-900 rounded-2xl p-8 shadow-2xl border border-emerald-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-emerald-300">Acceso Miembro</h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email de miembro"
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-serif"
                >
                  Acceder
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowMembershipModal(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-sm"
                  >
                    ¿No eres miembro? Únete aquí
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Membership Modal */}
        {showMembershipModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowMembershipModal(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative min-h-screen flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-emerald-800">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-3xl text-emerald-300">Únete al Club Verde Privé</h3>
                    <button
                      onClick={() => setShowMembershipModal(false)}
                      className="text-stone-400 hover:text-stone-200"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className="px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300"
                      />
                      <input
                        type="email"
                        placeholder="Email privado"
                        className="px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300"
                      />
                    </div>
                    
                    <div>
                      <select className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300">
                        <option>Seleccionar membresía</option>
                        <option>Classic - $89/mes</option>
                        <option>Gold - $189/mes</option>
                        <option>Black Label - $389/mes</option>
                      </select>
                    </div>
                    
                    <div>
                      <textarea
                        placeholder="¿Cómo conociste Verde Privé? (opcional)"
                        rows={3}
                        className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-300 resize-vertical"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 text-emerald-600"
                        required
                      />
                      <label className="text-stone-400 text-sm">
                        Confirmo que soy mayor de 21 años y acepto los términos de servicio y política de privacidad.
                      </label>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-serif py-4 text-lg"
                    >
                      Solicitar Membresía
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-stone-500 text-sm">
                      Todas las solicitudes son revisadas manualmente. 
                      Te contactaremos en 24-48 horas de forma completamente discreta.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setSelectedProduct(null)}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative min-h-screen flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-emerald-800">
                {(() => {
                  const product = products.find(p => p.id === selectedProduct);
                  if (!product) return null;
                  
                  return (
                    <>
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h2 className="font-serif text-3xl text-emerald-300 mb-2">{product.name}</h2>
                            <p className="text-stone-400">{product.category} • {product.type}</p>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(null)}
                            className="text-stone-400 hover:text-stone-200"
                          >
                            <span className="text-2xl">×</span>
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <div className="aspect-square bg-gradient-to-br from-emerald-800 to-stone-800 rounded-2xl flex items-center justify-center mb-6">
                              <span className="text-8xl opacity-70">
                                {product.category === "Flores Artesanales" ? "🌿" :
                                 product.category === "Extractos Premium" ? "🍯" :
                                 product.category === "Aceites & Tinturas" ? "💧" :
                                 product.category === "Accesorios de Lujo" ? "✨" :
                                 product.category === "Sets Exclusivos" ? "🎁" : "🌙"}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="mb-6">
                              <div className="text-3xl text-amber-400 font-light mb-2">${product.price}</div>
                              <div className="text-stone-500">{product.unit}</div>
                            </div>

                            <p className="text-stone-400 leading-relaxed mb-6">
                              {product.description}
                            </p>

                            {(product.thc !== "N/A" || product.cbd !== "N/A") && (
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                {product.thc !== "N/A" && (
                                  <div className="p-4 bg-stone-800 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{product.thc}</div>
                                    <div className="text-stone-500">THC</div>
                                  </div>
                                )}
                                {product.cbd !== "N/A" && (
                                  <div className="p-4 bg-stone-800 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-amber-400">{product.cbd}</div>
                                    <div className="text-stone-500">CBD</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {product.terpenes.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-emerald-300 mb-2">Terpenos</h4>
                                <div className="flex flex-wrap gap-2">
                                  {product.terpenes.map(terpene => (
                                    <span key={terpene} className="text-xs bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full">
                                      {terpene}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {product.effects.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-emerald-300 mb-2">Efectos</h4>
                                <div className="flex flex-wrap gap-2">
                                  {product.effects.map(effect => (
                                    <span key={effect} className="text-xs bg-amber-900/50 text-amber-300 px-3 py-1 rounded-full">
                                      {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4">
                              {product.exclusive ? (
                                <Button
                                  variant="outline"
                                  className="flex-1 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-stone-900 font-serif"
                                  onClick={() => setShowMembershipModal(true)}
                                >
                                  Únete para Comprar
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-serif"
                                  disabled={!product.inStock}
                                >
                                  {product.inStock ? "Agregar al Carrito" : "Agotado"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <a
          href="https://wa.me/16071234567"
          className="w-16 h-16 bg-emerald-700 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300 border-2 border-emerald-500"
        >
          💬
        </a>
      </motion.div>
    </main>
  );
}