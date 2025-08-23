"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";

const episodes = [
  {
    id: "ep-01",
    title: "El Arte de No Saber Nada",
    duration: "45 min",
    description: "Ciri y El Nolte reflexionan sobre la sabiduría de admitir ignorancia en un mundo de expertos falsos.",
    category: "Filosofía Callejera",
    date: "2024-12-15",
    spotifyUrl: "#",
    image: "/images/hbm/episode-01.jpg"
  },
  {
    id: "ep-02", 
    title: "Política para Dummies",
    duration: "52 min",
    description: "Desentrañando el circo político con humor negro y cero diplomacia.",
    category: "Política Sin Filtro",
    date: "2024-12-08",
    spotifyUrl: "#",
    image: "/images/hbm/episode-02.jpg"
  },
  {
    id: "ep-03",
    title: "Amor en Tiempos de Redes",
    duration: "38 min", 
    description: "Las relaciones modernas vistas desde el caos digital y la soledad analógica.",
    category: "Amor & Caos",
    date: "2024-12-01",
    spotifyUrl: "#",
    image: "/images/hbm/episode-03.jpg"
  },
  {
    id: "ep-04",
    title: "El Negocio de Ser Influencer",
    duration: "41 min",
    description: "Analizando la economía de la atención y por qué todos quieren ser famosos.",
    category: "Cultura Digital",
    date: "2024-11-24",
    spotifyUrl: "#",
    image: "/images/hbm/episode-04.jpg"
  }
];

const hosts = [
  {
    name: "Ciri",
    role: "Co-Host & Provocador Principal",
    description: "Escritor, filósofo callejero y maestro del arte de decir verdades incómodas con elegancia brutal.",
    iconicPhrase: "\"La verdad duele, pero la mentira mata.\"",
    avatar: "/images/hbm/ciri-avatar.svg",
    color: "#E50914"
  },
  {
    name: "El Nolte",
    role: "Co-Host & Voz de la Razón",
    description: "El equilibrio perfecto entre cordura e irreverencia. Experto en convertir el caos en conversación.",
    iconicPhrase: "\"Si no te incomoda, no estamos haciendo bien nuestro trabajo.\"",
    avatar: "/images/hbm/nolte-avatar.svg", 
    color: "#FFD60A"
  }
];

const clips = [
  {
    id: "clip-1",
    title: "Cuando el Wi-Fi se cae",
    platform: "TikTok",
    views: "125K",
    url: "#"
  },
  {
    id: "clip-2", 
    title: "Explicando la Inflación",
    platform: "Instagram",
    views: "89K", 
    url: "#"
  },
  {
    id: "clip-3",
    title: "Dating Apps vs Realidad",
    platform: "YouTube",
    views: "203K",
    url: "#"
  }
];

export default function HablandoMierdaPage() {
  const [isLive, setIsLive] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const iconicPhrase = "Recuerden, que aquí lo que estamos es hablando mierda.";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < iconicPhrase.length) {
        setTypewriterText(iconicPhrase.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Clock for live transmission
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live status (would connect to actual stream)
  useEffect(() => {
    const liveCheck = setInterval(() => {
      setIsLive(Math.random() > 0.7); // 30% chance of being live
    }, 5000);
    return () => clearInterval(liveCheck);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-surface to-background">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          {/* Sound waves animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-96 h-96 border border-brand-primary rounded-full"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.6,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Logo Animado */}
            <motion.div
              className="mb-8"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-9xl md:text-[12rem] font-black text-brand-primary mb-4 font-sans tracking-tighter">
                HBM
              </div>
              <motion.div
                className="w-24 h-1 bg-brand-primary mx-auto mb-4"
                animate={{ scaleX: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-text-primary font-sans">
              HABLANDO MIERDA
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-8 font-light max-w-3xl mx-auto">
              El podcast más irreverente del internet hispanohablante.
              <br />
              <span className="text-brand-primary font-medium">Sin filtros. Sin diplomacia. Con mucho estilo.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-8 py-4 text-lg"
                >
                  🎧 ESCUCHAR AHORA
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold px-8 py-4 text-lg"
                >
                  📺 VER CLIPS
                </Button>
              </motion.div>
            </div>

            {/* Live Indicator */}
            <AnimatePresence>
              {isLive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-full font-bold"
                >
                  <motion.div
                    className="w-3 h-3 bg-white rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  EN VIVO AHORA
                  <span className="text-sm opacity-90">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-brand-primary to-transparent rounded-full"></div>
        </motion.div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="font-black text-xl text-brand-primary"
              whileHover={{ scale: 1.1 }}
            >
              HBM
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#episodios" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                Episodios
              </a>
              <a href="#equipo" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                Equipo
              </a>
              <a href="#clips" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                Clips
              </a>
              <a href="#contacto" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                Contacto
              </a>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </nav>

      {/* Episodios Section */}
      <section id="episodios" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              ÚLTIMOS EPISODIOS
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Conversaciones sin filtros sobre todo lo que importa (y lo que no).
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {episodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border hover:border-brand-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  {/* Episode Image */}
                  <div className="aspect-video bg-gradient-to-br from-brand-primary/20 to-surface-elevated flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <span className="text-6xl opacity-60">🎙️</span>
                    <div className="absolute top-4 left-4">
                      <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        {episode.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {episode.duration}
                      </span>
                    </div>
                  </div>

                  {/* Episode Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <time className="text-sm text-text-muted">
                        {new Date(episode.date).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>

                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors">
                      {episode.title}
                    </h3>
                    
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {episode.description}
                    </p>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-primary-hover text-white"
                      >
                        ▶️ Reproducir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-text-secondary hover:bg-surface"
                      >
                        💚 Spotify
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold"
            >
              VER TODOS LOS EPISODIOS
            </Button>
          </div>
        </div>
      </section>

      {/* Radio en Vivo Section */}
      <section className="py-24 bg-gradient-to-b from-surface to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {/* Equalizer Animation */}
          <div className="flex items-end justify-center h-full gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-brand-primary w-4"
                animate={{ 
                  height: [20, 100, 60, 140, 80, 20],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-8 font-sans">
              RADIO EN VIVO
            </h2>
            
            <div className="bg-surface-elevated rounded-3xl p-12 border border-border shadow-2xl">
              {/* Live Status */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <motion.div
                  className={`w-4 h-4 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-400'}`}
                  animate={isLive ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xl font-bold">
                  {isLive ? 'TRANSMITIENDO AHORA' : 'FUERA DEL AIRE'}
                </span>
                <div className="text-text-muted">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              {/* Wave Visualizer */}
              <div className="flex items-center justify-center gap-1 mb-8">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-t from-brand-primary to-brand-primary/50 w-3 rounded-full"
                    animate={isLive ? { 
                      height: [20, 80, 40, 60, 30, 70, 20],
                    } : { height: 4 }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={!isLive}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-12 py-4 text-xl disabled:opacity-50"
              >
                {isLive ? '🔴 ESCUCHAR EN VIVO' : '⏸️ PRÓXIMA TRANSMISIÓN'}
              </Button>

              {!isLive && (
                <p className="text-text-muted mt-4">
                  Próxima transmisión: Viernes 8:00 PM EST
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Equipo Section */}
      <section id="equipo" className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              LOS HOSTS
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Los cerebros (y bocas) detrás del caos organizado.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {hosts.map((host, index) => (
              <motion.div
                key={host.name}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div className="bg-surface-elevated rounded-3xl p-8 border border-border hover:border-brand-primary/50 transition-all duration-300 text-center relative overflow-hidden">
                  {/* Background Effect */}
                  <div 
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ 
                      background: `linear-gradient(45deg, ${host.color}20, transparent)` 
                    }}
                  />

                  {/* Avatar */}
                  <div className="relative z-10 mb-6">
                    <div 
                      className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl border-4 group-hover:scale-110 transition-transform"
                      style={{ borderColor: host.color }}
                    >
                      {index === 0 ? '🎭' : '🎪'}
                    </div>
                  </div>

                  <h3 className="text-3xl font-black mb-2" style={{ color: host.color }}>
                    {host.name}
                  </h3>
                  <p className="text-text-muted font-medium mb-4">
                    {host.role}
                  </p>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {host.description}
                  </p>

                  {/* Iconic Phrase - appears on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="group-hover:bg-background/50 rounded-xl p-4 transition-all duration-300"
                  >
                    <blockquote 
                      className="font-bold italic text-lg"
                      style={{ color: host.color }}
                    >
                      {host.iconicPhrase}
                    </blockquote>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clips Section */}
      <section id="clips" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              CLIPS VIRALES
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Los momentos más épicos condensados para tu consumo rápido.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {clips.map((clip, index) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border hover:border-brand-primary/50 transition-all duration-300">
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-brand-primary/30 to-surface flex items-center justify-center relative">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"
                    >
                      <div className="w-0 h-0 border-l-[12px] border-l-black border-y-[8px] border-y-transparent ml-1"></div>
                    </motion.div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {clip.platform}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        {clip.views}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                      {clip.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"  
              size="lg"
              className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold"
            >
              VER MÁS CLIPS
            </Button>
          </div>
        </div>
      </section>

      {/* Support/Merch Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              APÓYANOS
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Mantén viva la irreverencia. Tu apoyo nos permite seguir hablando mierda sin filtros.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { item: "Gorra HBM", price: "$25", emoji: "🧢" },
              { item: "Camiseta Oficial", price: "$35", emoji: "👕" },
              { item: "Stickers Pack", price: "$10", emoji: "🏷️" }
            ].map((product, index) => (
              <motion.div
                key={product.item}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-surface-elevated rounded-2xl p-8 text-center border border-border hover:border-brand-primary/50 transition-all duration-300"
              >
                <div className="text-6xl mb-4">{product.emoji}</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{product.item}</h3>
                <div className="text-2xl font-black text-brand-primary mb-6">{product.price}</div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="primary"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold"
                  >
                    COMPRAR
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold px-12 py-4 text-xl"
              >
                ❤️ DONACIÓN DIRECTA
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              ÚNETE AL CAOS
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              ¿Tienes una anécdota loca? ¿Una opinión controversial? ¿Quieres ser parte del show? 
              Contáctanos y seamos cómplices del mejor contenido.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* WhatsApp */}
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="bg-surface-elevated rounded-2xl p-8 border border-border hover:border-green-500/50 transition-all duration-300">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">WhatsApp</h3>
                  <p className="text-text-secondary mb-6">
                    Envíanos tus historias más locas directamente
                  </p>
                  <Button
                    variant="primary"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                  >
                    ENVIAR MENSAJE
                  </Button>
                </div>
              </motion.div>

              {/* Discord */}
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="bg-surface-elevated rounded-2xl p-8 border border-border hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Discord</h3>
                  <p className="text-text-secondary mb-6">
                    Únete a la comunidad más irreverente
                  </p>
                  <Button
                    variant="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                  >
                    UNIRSE AL SERVER
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6">
              {[
                { platform: "Instagram", emoji: "📷", color: "from-pink-500 to-purple-500" },
                { platform: "TikTok", emoji: "🎵", color: "from-black to-red-500" },
                { platform: "YouTube", emoji: "📺", color: "from-red-500 to-red-600" },
                { platform: "Spotify", emoji: "🎧", color: "from-green-400 to-green-500" }
              ].map((social) => (
                <motion.a
                  key={social.platform}
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {social.emoji}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Typewriter */}
      <footer className="py-16 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl md:text-4xl font-bold text-text-primary mb-4 font-mono">
              {typewriterText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-brand-primary"
              >
                |
              </motion.span>
            </div>
            
            <div className="text-text-muted mt-8">
              <p>© 2024 Hablando Mierda (HBM) - Parte del ecosistema MaalCa</p>
              <p className="mt-2">Desde Elmira, NY para el mundo 🌎</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </main>
  );
}