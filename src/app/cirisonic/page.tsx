"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const services = [
  {
    id: "text-ai",
    icon: "✍️",
    title: "Textos IA",
    subtitle: "Content Generation",
    description: "Artículos, posts, newsletters y copy optimizado generado por IA avanzada con tu tono de marca.",
    features: ["SEO optimizado", "Múltiples tonos", "Personalización", "Auto-planning"],
    color: "blue",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    id: "image-ai", 
    icon: "🎨",
    title: "Imágenes & Logos",
    subtitle: "Visual Creation",
    description: "Diseños únicos, logos profesionales e imágenes para redes sociales creadas por IA.",
    features: ["Marca consistente", "Formatos múltiples", "Estilos variados", "Templates"],
    color: "purple",
    gradient: "from-purple-500 to-pink-400"
  },
  {
    id: "audio-ai",
    icon: "🎧", 
    title: "Audio Narrado",
    subtitle: "Voice Synthesis",
    description: "Convierte texto en audio profesional con voces sintéticas naturales para podcasts y contenido.",
    features: ["Voces naturales", "Múltiples idiomas", "Emociones", "Música de fondo"],
    color: "emerald",
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    id: "video-ai",
    icon: "🎬",
    title: "Video Automatizado", 
    subtitle: "Motion Graphics",
    description: "Reels, presentaciones y videos promocionales generados automáticamente con IA.",
    features: ["Templates pro", "Auto-subtitulado", "Transiciones", "Optimización"],
    color: "orange",
    gradient: "from-orange-500 to-red-400"
  }
];

const useCases = [
  {
    title: "Startups",
    description: "Marketing automatizado sin equipo grande",
    icon: "🚀",
    benefits: ["Reduce costos 80%", "Velocidad x10", "Marca consistente", "Escalabilidad"]
  },
  {
    title: "Autores/Creadores",
    description: "Contenido editorial profesional",
    icon: "✨",
    benefits: ["Más audiencia", "Engagement alto", "Contenido diario", "Monetización"]
  },
  {
    title: "PYMEs",
    description: "Presencia digital sin complicaciones",
    icon: "🎯",
    benefits: ["Setup rápido", "ROI medible", "Multi-plataforma", "Auto-gestión"]
  },
  {
    title: "Corporativos",
    description: "Análisis y escalabilidad empresarial",
    icon: "📊",
    benefits: ["Analytics profundo", "Multi-marca", "Compliance", "Integración API"]
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "mes",
    description: "Para creadores individuales y startups pequeñas",
    features: [
      "50 textos IA/mes",
      "20 imágenes/mes", 
      "5 audios/mes",
      "2 videos/mes",
      "Plantillas básicas",
      "Soporte por email"
    ],
    available: true,
    popular: false
  },
  {
    name: "Pro",
    price: "$79", 
    period: "mes",
    description: "Para equipos y empresas en crecimiento",
    features: [
      "500 textos IA/mes",
      "200 imágenes/mes",
      "50 audios/mes", 
      "20 videos/mes",
      "Templates premium",
      "Analytics avanzado",
      "Colaboración en equipo",
      "Soporte prioritario"
    ],
    available: false,
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contacto",
    description: "Para organizaciones con necesidades específicas",
    features: [
      "Generación ilimitada",
      "Marca personalizada", 
      "API dedicada",
      "Integraciones custom",
      "Soporte 24/7",
      "Training personalizado",
      "SLA garantizado"
    ],
    available: false,
    popular: false
  }
];

export default function CiriSonicPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [particleAnimation, setParticleAnimation] = useState(0);

  // Particle animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleAnimation(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here would integrate with email service
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Floating Data Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  x: [Math.random() * 100, Math.random() * 100 + 200],
                  y: [Math.random() * 100, Math.random() * 100 + 100],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 6 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/50 to-purple-950/30" />
        </div>


        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            {/* Futuristic Logo */}
            <motion.div
              animate={{ 
                rotateY: [0, 15, -15, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center border-2 border-cyan-400/30 shadow-2xl shadow-blue-500/30 backdrop-blur-sm">
                <span className="text-5xl">🤖</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                CiriSonic
              </span>
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-2xl md:text-4xl lg:text-5xl font-light mb-8 text-gray-300"
            >
              Fábrica IA de Contenido
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              La plataforma de inteligencia artificial que genera textos, imágenes, audio y video 
              con <span className="text-cyan-400 font-semibold">estrategia</span> y 
              <span className="text-purple-400 font-semibold"> engagement aumentado</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-xl border-0 shadow-lg shadow-blue-500/25"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🚀 Solicitar Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold px-12 py-4 text-xl"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Funciones
              </Button>
            </motion.div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              {[
                { value: "10x", label: "Más Rápido" },
                { value: "80%", label: "Menos Costos" },
                { value: "24/7", label: "Siempre Activo" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-400"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-medium">Descubrir</span>
            <div className="w-0.5 h-16 bg-gradient-to-b from-blue-400 to-transparent rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              CiriSonic
            </span>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Servicios
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Cómo Funciona
              </a>
              <a href="#demo" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Demo
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Precios
              </a>
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                Solicitar Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Services Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              ¿Qué hace CiriSonic?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Una suite completa de herramientas de IA para crear contenido de nivel profesional 
              en minutos, no horas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 shadow-lg backdrop-blur-sm">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`text-6xl bg-gradient-to-r ${service.gradient} bg-clip-text`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                        {service.title}
                      </h3>
                      <p className={`text-sm font-medium text-${service.color}-400 mb-4`}>
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {service.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span className="text-green-400">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Button
                      variant="outline"
                      className={`border-2 border-${service.color}-500 text-${service.color}-400 hover:bg-${service.color}-500 hover:text-white font-medium`}
                    >
                      Ver Demo
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Un proceso simple de 4 pasos que transforma tus ideas en contenido viral
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-30"></div>
            
            {[
              {
                step: "1",
                title: "Genera",
                description: "Describe tu idea y la IA crea contenido optimizado",
                icon: "🎯",
                color: "blue"
              },
              {
                step: "2", 
                title: "Personaliza",
                description: "Ajusta el tono, estilo y marca según tu audiencia",
                icon: "🎨",
                color: "purple"
              },
              {
                step: "3",
                title: "Publica",
                description: "Programa y publica en múltiples plataformas",
                icon: "🚀",
                color: "cyan"
              },
              {
                step: "4",
                title: "Mide Impacto",
                description: "Analiza métricas y optimiza el rendimiento",
                icon: "📊",
                color: "green"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-${item.color}-500/30 relative z-10`}
                >
                  {item.step}
                </motion.div>

                {/* Icon */}
                <div className="text-5xl mb-4">
                  {item.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Mockup Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              Dashboard CiriSonic
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Una interfaz intuitiva que pone el poder de la IA al alcance de todos
            </p>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative max-w-6xl mx-auto"
          >
            {/* Browser Frame */}
            <div className="bg-gray-800 rounded-t-3xl p-4 border border-gray-600">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 bg-gray-700 text-gray-300 px-4 py-1 rounded-lg text-sm flex-1">
                  app.cirisonic.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-b-3xl p-8 border-l border-r border-b border-gray-600">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Hola, Creator! 👋</h3>
                  <p className="text-gray-400">Tienes 3 proyectos pendientes de publicar</p>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    + Crear Contenido
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[
                  { title: "Engagement", value: "+247%", icon: "📈", color: "green" },
                  { title: "Contenido Creado", value: "1,284", icon: "🎨", color: "blue" },
                  { title: "Alcance Total", value: "94.2K", icon: "🌎", color: "purple" },
                  { title: "ROI Promedio", value: "435%", icon: "💰", color: "yellow" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-${stat.color}-500/50 transition-all`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{stat.icon}</span>
                      <span className={`text-${stat.color}-400 text-sm font-medium`}>↗</span>
                    </div>
                    <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {stat.title}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Tools Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Generar Texto",
                    description: "Artículos, posts y copy optimizado",
                    icon: "✍️",
                    status: "Activo",
                    color: "blue"
                  },
                  {
                    title: "Crear Reel",
                    description: "Videos virales para redes sociales", 
                    icon: "🎬",
                    status: "Procesando...",
                    color: "purple"
                  },
                  {
                    title: "Hacer VoiceOver",
                    description: "Narración profesional en segundos",
                    icon: "🎧", 
                    status: "Disponible",
                    color: "emerald"
                  }
                ].map((tool, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm"
                  >
                    <div className="text-4xl mb-4">{tool.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-2">{tool.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs bg-${tool.color}-500/20 text-${tool.color}-400 px-3 py-1 rounded-full`}>
                        {tool.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-${tool.color}-500 text-${tool.color}-400 hover:bg-${tool.color}-500 hover:text-white text-xs`}
                      >
                        Usar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-30 -z-10"></div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-xl border-0 shadow-lg shadow-blue-500/25"
            >
              🚀 Probar Dashboard Gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              Casos de Uso
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              CiriSonic se adapta a cualquier industria y tamaño de empresa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 text-center">
                  <div className="text-6xl mb-6">{useCase.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>
                  
                  <div className="space-y-3">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-green-400">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tu nivel de creación de contenido
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                <div className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border-2 transition-all duration-500 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                    : 'border-gray-700/50 hover:border-blue-500/50'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                        Más Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      {plan.price}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {plan.period}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className={`w-full font-bold text-lg py-3 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0' 
                        : plan.available
                          ? 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
                          : 'border-2 border-gray-600 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!plan.available}
                  >
                    {plan.available ? `Elegir ${plan.name}` : 'Próximamente'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              Sé de los Primeros
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Únete a los pioneros que están transformando su creación de contenido 
              con inteligencia artificial avanzada
            </p>

            {/* Email Capture Form */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-12 border border-gray-700/50 backdrop-blur-sm max-w-2xl mx-auto"
            >
              <div className="text-6xl mb-8">🚀</div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Acceso Anticipado
              </h3>
              <p className="text-gray-400 mb-8">
                Obtén acceso prioritario al futuro del contenido inteligente. 
                Sin spam, solo actualizaciones importantes.
              </p>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="flex-1 px-6 py-4 bg-gray-900 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-lg"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg border-0 whitespace-nowrap"
                      >
                        Reservar Acceso
                      </Button>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Al suscribirte, aceptas recibir emails sobre CiriSonic. Puedes cancelar en cualquier momento.
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-6">✨</div>
                    <h4 className="text-2xl font-bold text-green-400 mb-4">
                      ¡Perfecto!
                    </h4>
                    <p className="text-gray-400">
                      Te contactaremos pronto con tu acceso prioritario a CiriSonic.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto"
            >
              {[
                { count: "500+", label: "En lista de espera" },
                { count: "50+", label: "Beta testers" },
                { count: "98%", label: "Satisfacción" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    {item.count}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                CiriSonic
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                La fábrica de IA que transforma ideas en contenido viral. 
                Parte del ecosistema MaalCa, construyendo el futuro del contenido inteligente.
              </p>
              <div className="text-gray-500 text-sm">
                <p className="mb-2">🤖 Inteligencia Artificial Responsable</p>
                <p>⚡ Creación de Contenido Ético</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Producto</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="#features" className="block hover:text-blue-400 transition-colors">Servicios</a>
                <a href="#how-it-works" className="block hover:text-blue-400 transition-colors">Cómo Funciona</a>
                <a href="#pricing" className="block hover:text-blue-400 transition-colors">Precios</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">API Docs</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">MaalCa Ecosystem</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="/" className="block hover:text-blue-400 transition-colors">MaalCa Home</a>
                <a href="/ciriwhispers" className="block hover:text-blue-400 transition-colors">CiriWhispers</a>
                <a href="/hablando-mierda" className="block hover:text-blue-400 transition-colors">Hablando Mierda</a>
                <a href="/masa-tina" className="block hover:text-blue-400 transition-colors">Masa Tina</a>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-2">
              © 2024 CiriSonic - Parte del ecosistema MaalCa
            </p>
            <p className="text-gray-600 text-xs italic">
              "El futuro del contenido es inteligente"
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300 border-0"
        >
          🚀
        </Button>
      </motion.div>
    </main>
  );
}