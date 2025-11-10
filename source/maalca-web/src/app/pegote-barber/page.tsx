"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const services = [
  {
    id: "corte-clasico",
    name: "Corte Clásico Dominicano",
    nameEn: "Classic Dominican Cut",
    description: "El estilo tradicional con técnicas modernas",
    descriptionEn: "Traditional style with modern techniques",
    price: 25,
    duration: "45 min",
    popular: false,
    image: "💈"
  },
  {
    id: "diseño-especial", 
    name: "Diseño Especial",
    nameEn: "Special Design",
    description: "Cortes creativos y diseños únicos",
    descriptionEn: "Creative cuts and unique designs",
    price: 35,
    duration: "60 min", 
    popular: true,
    image: "✨"
  },
  {
    id: "barba-completa",
    name: "Barba Completa",
    nameEn: "Full Beard Service",
    description: "Arreglo profesional de barba y bigote",
    descriptionEn: "Professional beard and mustache grooming", 
    price: 20,
    duration: "30 min",
    popular: false,
    image: "🧔"
  },
  {
    id: "combo-premium",
    name: "Combo Premium",
    nameEn: "Premium Combo",
    description: "Corte + Barba + Acabado perfecto",
    descriptionEn: "Cut + Beard + Perfect finish",
    price: 40,
    duration: "75 min",
    popular: true, 
    image: "👑"
  },
  {
    id: "corte-ninos",
    name: "Corte Niños",
    nameEn: "Kids Cut",
    description: "Para los pequeños de la familia",
    descriptionEn: "For the little ones in the family",
    price: 20,
    duration: "30 min",
    popular: false,
    image: "👶"
  },
  {
    id: "evento-especial",
    name: "Evento Especial",
    nameEn: "Special Event",
    description: "Para bodas, graduaciones y ocasiones importantes",
    descriptionEn: "For weddings, graduations and important occasions",
    price: 50,
    duration: "90 min",
    popular: false,
    image: "🎉"
  }
];

const barbers = [
  {
    id: "pegote",
    name: "Pegote",
    specialty: "Fundador y Maestro",
    specialtyEn: "Founder and Master",
    experience: "15+ años",
    description: "El maestro dominicano que combina tradición con innovación",
    descriptionEn: "Dominican master combining tradition with innovation",
    available: true,
    image: "👨‍💼"
  },
  {
    id: "junior",
    name: "Junior",
    specialty: "Especialista en Diseños",
    specialtyEn: "Design Specialist", 
    experience: "8 años",
    description: "Experto en cortes creativos y estilos modernos",
    descriptionEn: "Expert in creative cuts and modern styles",
    available: true,
    image: "🎨"
  }
];

const testimonials = [
  {
    name: "Carlos M.",
    location: "Elmira, NY",
    text: "La mejor barbería dominicana en todo el área. Pegote es un artista.",
    textEn: "The best Dominican barbershop in the entire area. Pegote is an artist.",
    rating: 5,
    service: "Combo Premium"
  },
  {
    name: "Miguel R.", 
    location: "Corning, NY",
    text: "Ambiente familiar, calidad profesional. Me siento como en casa.",
    textEn: "Family atmosphere, professional quality. I feel at home.",
    rating: 5,
    service: "Corte Clásico"
  },
  {
    name: "David S.",
    location: "Elmira Heights, NY", 
    text: "El sistema de reservas online es genial. Nunca más esperar en fila.",
    textEn: "The online booking system is great. Never wait in line again.",
    rating: 5,
    service: "Diseño Especial"
  }
];

export default function PegoteBarberPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string>("pegote");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && selectedService && selectedDate && selectedTime) {
      setBookingConfirmed(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setShowQRModal(true);
      }, 2000);
    }
  };

  const availableTimes = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-red-800 to-blue-900">
        {/* Dominican Flag Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            background: `repeating-linear-gradient(
              45deg,
              #002B7F 0px,
              #002B7F 20px,
              #FFFFFF 20px,
              #FFFFFF 40px,
              #CE1126 40px,
              #CE1126 60px,
              #FFFFFF 60px,
              #FFFFFF 80px
            )`
          }} />
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <div className="text-4xl">💈</div>
                <div>
                  <div className="text-2xl font-black text-white">PEGOTE</div>
                  <div className="text-sm text-red-300 font-medium">BARBER SHOP</div>
                </div>
              </motion.div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#servicios" className="text-white hover:text-red-300 transition-colors font-medium">
                  {getText("Servicios", "Services")}
                </a>
                <a href="#reservas" className="text-white hover:text-red-300 transition-colors font-medium">
                  {getText("Reservas", "Booking")}
                </a>
                <a href="#nosotros" className="text-white hover:text-red-300 transition-colors font-medium">
                  {getText("Nosotros", "About")}
                </a>
                <a href="#contacto" className="text-white hover:text-red-300 transition-colors font-medium">
                  {getText("Contacto", "Contact")}
                </a>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors text-sm"
                >
                  🇩🇴 {language.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            {/* Dominican Crown Icon */}
            <motion.div
              animate={{ 
                rotateY: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <span className="text-6xl">👑</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-7xl md:text-9xl lg:text-[10rem] font-black mb-6 leading-tight text-white drop-shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              PEGOTE
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-3xl md:text-5xl font-bold mb-8 text-red-300"
            >
              BARBER SHOP
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="text-2xl md:text-3xl text-white/90 mb-4 font-medium"
            >
              {getText(
                "La barbería dominicana en Elmira, NY", 
                "The Dominican barbershop in Elmira, NY"
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="text-lg text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {getText(
                "Tradición dominicana, tecnología moderna. Reserva tu turno online y vive la experiencia Pegote.",
                "Dominican tradition, modern technology. Book your appointment online and live the Pegote experience."
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowBookingModal(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black px-12 py-5 text-xl border-0 shadow-lg transform hover:scale-105 transition-all"
              >
                🗓️ {getText("Reserva tu Turno", "Book Your Appointment")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-3 border-white text-white hover:bg-white hover:text-blue-900 font-bold px-12 py-5 text-xl backdrop-blur-sm"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                👀 {getText("Ver Servicios", "View Services")}
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              {[
                { value: "15+", label: getText("Años de Experiencia", "Years Experience") },
                { value: "2000+", label: getText("Clientes Felices", "Happy Clients") },
                { value: "24/7", label: getText("Reservas Online", "Online Booking") }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm font-medium">
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
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-medium">{getText("Descubrir", "Discover")}</span>
            <div className="w-0.5 h-16 bg-gradient-to-b from-white to-transparent rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-black text-gray-900 mb-6">
              {getText("SERVICIOS", "SERVICES")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText(
                "Servicios profesionales con el estilo dominicano que nos caracteriza",
                "Professional services with the Dominican style that characterizes us"
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer relative"
              >
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-blue-300 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  {service.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold">
                        {getText("MÁS POPULAR", "MOST POPULAR")}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{service.image}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {getText(service.name, service.nameEn)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {getText(service.description, service.descriptionEn)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-blue-600">${service.price}</div>
                      <div className="text-gray-500 text-sm">{service.duration}</div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedService(service.id);
                        setShowBookingModal(true);
                      }}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3"
                    >
                      {getText("Reservar", "Book Now")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Queue Section */}
      <section id="reservas" className="py-24 bg-gradient-to-br from-blue-50 to-red-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-black text-gray-900 mb-6">
              {getText("FILA VIRTUAL", "VIRTUAL QUEUE")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText(
                "Tecnología innovadora para tu comodidad. Reserva online y recibe tu código QR.",
                "Innovative technology for your comfort. Book online and receive your QR code."
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                {
                  icon: "📱",
                  title: getText("Reserva Online", "Book Online"),
                  description: getText("Elige tu servicio, barbero y horario desde tu celular", "Choose your service, barber and time from your phone")
                },
                {
                  icon: "📋",
                  title: getText("Confirmación QR", "QR Confirmation"), 
                  description: getText("Recibe tu código QR único por email y WhatsApp", "Receive your unique QR code via email and WhatsApp")
                },
                {
                  icon: "⏰",
                  title: getText("Sin Esperas", "No Waiting"),
                  description: getText("Llega a tu hora exacta, tu turno está garantizado", "Arrive at your exact time, your turn is guaranteed")
                },
                {
                  icon: "🔔",
                  title: getText("Recordatorios", "Reminders"),
                  description: getText("Te avisamos 24h y 1h antes de tu cita", "We remind you 24h and 1h before your appointment")
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="text-4xl">{benefit.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* QR Code Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {getText("Tu Código de Reserva", "Your Booking Code")}
                </h3>
                
                {/* QR Code Mockup */}
                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1 p-4">
                    {[...Array(64)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Cliente:", "Client:")}</span>
                    <span className="font-bold">Carlos M.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Servicio:", "Service:")}</span>
                    <span className="font-bold">{getText("Combo Premium", "Premium Combo")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Barbero:", "Barber:")}</span>
                    <span className="font-bold">Pegote</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Hora:", "Time:")}</span>
                    <span className="font-bold text-red-600">3:30 PM</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setShowBookingModal(true)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold"
                >
                  {getText("Hacer Reserva", "Make Booking")}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-black text-gray-900 mb-6">
              {getText("NUESTRO EQUIPO", "OUR TEAM")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText(
                "Maestros dominicanos con años de experiencia y pasión por el arte del corte",
                "Dominican masters with years of experience and passion for the art of cutting"
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {barbers.map((barber, index) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-3xl p-8 shadow-xl">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center mb-6 text-6xl">
                    {barber.image}
                  </div>
                  
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{barber.name}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    {getText(barber.specialty, barber.specialtyEn)}
                  </p>
                  <p className="text-red-600 font-medium mb-4">{barber.experience}</p>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {getText(barber.description, barber.descriptionEn)}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${barber.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {getText(
                        barber.available ? "Disponible" : "Ocupado",
                        barber.available ? "Available" : "Busy"
                      )}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedBarber(barber.id);
                      setShowBookingModal(true);
                    }}
                    disabled={!barber.available}
                    className={`${barber.available 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                      : 'bg-gray-400 cursor-not-allowed'
                    } text-white font-bold px-8 py-3`}
                  >
                    {getText(
                      barber.available ? "Reservar con " + barber.name : "No Disponible",
                      barber.available ? "Book with " + barber.name : "Not Available"
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-black text-white mb-6">
              {getText("LO QUE DICEN NUESTROS CLIENTES", "WHAT OUR CLIENTS SAY")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-red-400 mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{getText(testimonial.text, testimonial.textEn)}"
                </p>
                
                <div className="border-t pt-4">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.location}</div>
                  <div className="text-blue-600 text-sm font-medium">{testimonial.service}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Culture Section */}
      <section id="nosotros" className="py-24 bg-gradient-to-br from-blue-900 via-red-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-black mb-6">
              {getText("NUESTRA HISTORIA", "OUR STORY")}
            </h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  {getText(
                    "Pegote Barber Shop nació del sueño de traer la auténtica tradición dominicana a Elmira, NY. Más que una barbería, somos un pedacito de la cultura dominicana en el corazón de Nueva York.",
                    "Pegote Barber Shop was born from the dream of bringing authentic Dominican tradition to Elmira, NY. More than a barbershop, we are a piece of Dominican culture in the heart of New York."
                  )}
                </p>
                <p>
                  {getText(
                    "Combinamos las técnicas ancestrales que aprendimos en nuestra tierra con la tecnología moderna, ofreciendo una experiencia única que respeta nuestras raíces mientras abraza la innovación.",
                    "We combine the ancestral techniques we learned in our homeland with modern technology, offering a unique experience that respects our roots while embracing innovation."
                  )}
                </p>
                <p>
                  {getText(
                    "Cada corte es una obra de arte, cada cliente es familia. Aquí no solo cortamos cabello, creamos confianza y preservamos cultura.",
                    "Every cut is a work of art, every client is family. Here we don't just cut hair, we create confidence and preserve culture."
                  )}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🇩🇴</div>
                  <div className="font-bold">{getText("Orgullo Dominicano", "Dominican Pride")}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-bold">{getText("Calidad Garantizada", "Quality Guaranteed")}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-8xl mb-6">💈</div>
                <h3 className="text-3xl font-bold mb-4">
                  {getText("Más que una Barbería", "More than a Barbershop")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>{getText("Tradición:", "Tradition:")}</span>
                    <span className="font-bold">15+ años</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>{getText("Clientes:", "Clients:")}</span>
                    <span className="font-bold">2000+</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span>{getText("Satisfacción:", "Satisfaction:")}</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>{getText("Innovación:", "Innovation:")}</span>
                    <span className="font-bold">🚀</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-black text-gray-900 mb-6">
              {getText("CONTACTO", "CONTACT")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              {getText("Estamos aquí para ti", "We're here for you")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center text-white text-xl">
                  📍
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {getText("Ubicación", "Location")}
                  </h3>
                  <p className="text-gray-600">
                    123 Main Street<br />
                    Elmira, NY 14901<br />
                    {getText("Estados Unidos", "United States")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center text-white text-xl">
                  📞
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {getText("Teléfono", "Phone")}
                  </h3>
                  <p className="text-gray-600">
                    <a href="tel:+16071234567" className="hover:text-blue-600">
                      +1 (607) 123-4567
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center text-white text-xl">
                  ⏰
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {getText("Horarios", "Hours")}
                  </h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{getText("Lunes - Viernes:", "Monday - Friday:")} 9:00 AM - 7:00 PM</p>
                    <p>{getText("Sábados:", "Saturday:")} 8:00 AM - 6:00 PM</p>
                    <p>{getText("Domingos:", "Sunday:")} 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {getText("Síguenos", "Follow Us")}
                </h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xl transition-colors">
                    📘
                  </a>
                  <a href="#" className="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white text-xl transition-colors">
                    📷
                  </a>
                  <a href="#" className="w-12 h-12 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center text-white text-xl transition-colors">
                    🎵
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={getText("Nombre completo", "Full name")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder={getText("Teléfono", "Phone")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>{getText("Seleccionar servicio", "Select service")}</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {getText(service.name, service.nameEn)} - ${service.price}
                    </option>
                  ))}
                </select>
                
                <textarea
                  placeholder={getText("Mensaje (opcional)", "Message (optional)")}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 text-lg"
                >
                  {getText("Enviar Mensaje", "Send Message")}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">💈</div>
                <div>
                  <div className="text-2xl font-black">PEGOTE</div>
                  <div className="text-sm text-red-300 font-medium">BARBER SHOP</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                {getText(
                  "La barbería dominicana en Elmira, NY. Tradición, calidad y tecnología al servicio de tu estilo.",
                  "The Dominican barbershop in Elmira, NY. Tradition, quality and technology at the service of your style."
                )}
              </p>
              <div className="text-gray-500 text-sm">
                <p className="mb-2">🇩🇴 {getText("Orgullo Dominicano", "Dominican Pride")}</p>
                <p>💈 {getText("Desde 2008", "Since 2008")}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{getText("Enlaces", "Links")}</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="#servicios" className="block hover:text-red-400 transition-colors">{getText("Servicios", "Services")}</a>
                <a href="#reservas" className="block hover:text-red-400 transition-colors">{getText("Reservas", "Booking")}</a>
                <a href="#nosotros" className="block hover:text-red-400 transition-colors">{getText("Nosotros", "About")}</a>
                <a href="#contacto" className="block hover:text-red-400 transition-colors">{getText("Contacto", "Contact")}</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{getText("MaalCa Ecosystem", "MaalCa Ecosystem")}</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="/" className="block hover:text-red-400 transition-colors">MaalCa Home</a>
                <a href="/cirisonic" className="block hover:text-red-400 transition-colors">CiriSonic</a>
                <a href="/ciriwhispers" className="block hover:text-red-400 transition-colors">CiriWhispers</a>
                <a href="/masa-tina" className="block hover:text-red-400 transition-colors">Cocina Tina</a>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-2">
              © 2024 Pegote Barber Shop - {getText("Parte del ecosistema MaalCa", "Part of MaalCa ecosystem")}
            </p>
            <p className="text-gray-600 text-xs italic">
              "{getText("Tu estilo, nuestra tradición", "Your style, our tradition")}"
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <a
          href="https://wa.me/16071234567"
          className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300"
        >
          💬
        </a>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowBookingModal(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative min-h-screen flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {getText("Reservar Cita", "Book Appointment")}
                    </h3>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="text-white hover:text-gray-200 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {!bookingConfirmed ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleBooking}
                        className="space-y-6"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder={getText("Nombre completo", "Full name")}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="tel"
                            placeholder={getText("Teléfono", "Phone")}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <select 
                          value={selectedService || ''}
                          onChange={(e) => setSelectedService(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{getText("Seleccionar servicio", "Select service")}</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {getText(service.name, service.nameEn)} - ${service.price} ({service.duration})
                            </option>
                          ))}
                        </select>

                        <select 
                          value={selectedBarber}
                          onChange={(e) => setSelectedBarber(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {barbers.filter(b => b.available).map(barber => (
                            <option key={barber.id} value={barber.id}>
                              {barber.name} - {getText(barber.specialty, barber.specialtyEn)}
                            </option>
                          ))}
                        </select>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select 
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">{getText("Seleccionar hora", "Select time")}</option>
                            {availableTimes.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 text-lg"
                        >
                          {getText("Confirmar Reserva", "Confirm Booking")}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="text-8xl mb-6">✅</div>
                        <h4 className="text-3xl font-bold text-green-600 mb-4">
                          {getText("¡Reserva Confirmada!", "Booking Confirmed!")}
                        </h4>
                        <p className="text-gray-600 mb-6">
                          {getText(
                            "Te enviaremos tu código QR por email y WhatsApp en unos minutos.",
                            "We'll send you your QR code via email and WhatsApp in a few minutes."
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowQRModal(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative min-h-screen flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl text-center p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {getText("Tu Código QR", "Your QR Code")}
                </h3>
                
                <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1 p-4">
                    {[...Array(64)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-left bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Cliente:", "Client:")}</span>
                    <span className="font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Servicio:", "Service:")}</span>
                    <span className="font-bold">
                      {selectedService ? getText(
                        services.find(s => s.id === selectedService)?.name || '',
                        services.find(s => s.id === selectedService)?.nameEn || ''
                      ) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Barbero:", "Barber:")}</span>
                    <span className="font-bold">
                      {barbers.find(b => b.id === selectedBarber)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Fecha:", "Date:")}</span>
                    <span className="font-bold">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{getText("Hora:", "Time:")}</span>
                    <span className="font-bold text-red-600">{selectedTime}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                  {getText(
                    "Muestra este código al llegar. También lo enviamos por email.",
                    "Show this code when you arrive. We also sent it via email."
                  )}
                </p>

                <Button
                  onClick={() => setShowQRModal(false)}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold py-3"
                >
                  {getText("Perfecto", "Perfect")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}