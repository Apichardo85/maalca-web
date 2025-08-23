"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const menuItems = [
  {
    id: "caja-picaderas",
    name: "Caja de Picaderas",
    description: "La mezcla perfecta de empanadas, pastelitos, quipes y croquetas. Ideal para compartir.",
    price: 45,
    image: "/images/masa-tina/caja-picaderas.jpg",
    category: "Combos",
    occasion: ["Reunión de amigos", "Merienda", "Oficina"],
    items: ["8 Empanadas mixtas", "6 Pastelitos de pollo", "4 Quipes", "4 Croquetas", "Salsas caseras"],
    serves: "4-6 personas"
  },
  {
    id: "mini-catering",
    name: "Mini Catering Familiar",
    description: "Bandeja completa con nuestros mejores platillos dominicanos. Perfecto para eventos pequeños.",
    price: 85,
    image: "/images/masa-tina/mini-catering.jpg",
    category: "Catering",
    occasion: ["Eventos", "Reunión de amigos"],
    items: ["Pollo guisado", "Arroz blanco", "Habichuelas rojas", "Ensalada verde", "Plátanos maduros", "Yuca hervida"],
    serves: "8-10 personas"
  },
  {
    id: "desayuno-dominicano",
    name: "Desayuno Tradicional",
    description: "Mangu con cebollitas, huevos fritos, salami y queso. Como en casa de abuela.",
    price: 25,
    image: "/images/masa-tina/desayuno.jpg",
    category: "Desayunos",
    occasion: ["Merienda"],
    items: ["Mangú de plátano verde", "Huevos fritos", "Salami dominicano", "Queso frito", "Cebollitas caramelizadas"],
    serves: "2 personas"
  },
  {
    id: "dulces-tradicionales",
    name: "Dulces de la Casa",
    description: "Selección artesanal de nuestros dulces favoritos: majarete, tres golpes y flan de coco.",
    price: 30,
    image: "/images/masa-tina/dulces.jpg",
    category: "Postres",
    occasion: ["Merienda", "Eventos"],
    items: ["Majarete casero", "Tres golpes", "Flan de coco", "Dulce de leche cortada", "Galletas de jengibre"],
    serves: "4-5 personas"
  },
  {
    id: "caja-personalizada",
    name: "Caja Personalizada",
    description: "Arma tu propia selección con nuestros platillos favoritos. Tú decides qué va adentro.",
    price: 0,
    image: "/images/masa-tina/personalizada.jpg",
    category: "Personalizado",
    occasion: ["Reunión de amigos", "Eventos", "Merienda", "Oficina"],
    items: ["Selecciona tus favoritos", "Mínimo 6 items", "Máximo 15 items"],
    serves: "Variable"
  },
  {
    id: "cafe-tertulia",
    name: "Café y Tertulia",
    description: "Café dominicano premium con selección de pastelitos dulces y salados para acompañar.",
    price: 35,
    image: "/images/masa-tina/cafe-tertulia.jpg",
    category: "Experiencias",
    occasion: ["Merienda"],
    items: ["Café dominicano especial", "Mini tres leches", "Pastelitos mixtos", "Galletas artesanales", "Conversación incluida"],
    serves: "2-3 personas"
  }
];

const subscriptionPlans = [
  {
    id: "basico",
    name: "Plan Básico",
    description: "Una caja de picaderas cada semana",
    price: 40,
    frequency: "semanal",
    items: ["1 Caja de picaderas", "Variedad rotativa", "Entrega gratuita"],
    popular: false
  },
  {
    id: "familiar",
    name: "Plan Familiar",  
    description: "Combinación perfecta para toda la familia",
    price: 70,
    frequency: "semanal",
    items: ["1 Mini catering", "1 Caja de dulces", "Menú personalizable", "Entrega premium"],
    popular: true
  },
  {
    id: "premium",
    name: "Plan Premium",
    description: "La experiencia completa Masa Tina",
    price: 120,
    frequency: "semanal", 
    items: ["2 Mini caterings", "Dulces artesanales", "Café dominicano", "Acceso a eventos exclusivos", "Chef personal mensual"],
    popular: false
  }
];

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Elmira, NY",
    text: "La comida sabe exactamente como la hacía mi abuela en Santiago. Masa Tina me transporta a casa con cada bocado.",
    rating: 5,
    image: "/images/masa-tina/testimonial-1.jpg"
  },
  {
    id: 2,
    name: "Carlos Martínez",
    location: "Corning, NY",
    text: "Pedí el mini catering para una reunión familiar y todos quedaron fascinados. La calidad es excepcional.",
    rating: 5,
    image: "/images/masa-tina/testimonial-2.jpg"
  },
  {
    id: 3,
    name: "Ana Rivera",
    location: "Horseheads, NY", 
    text: "El Club de Lectura Chocolate es mi evento favorito del mes. Comida deliciosa y conversaciones increíbles.",
    rating: 5,
    image: "/images/masa-tina/testimonial-3.jpg"
  }
];

export default function MasaTinaPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = ["Todos", "Combos", "Catering", "Desayunos", "Postres", "Experiencias"];
  const occasions = ["Reunión de amigos", "Eventos", "Merienda", "Oficina"];

  const filteredItems = selectedCategory === "Todos" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: any) => {
    setCart([...cart, { ...item, quantity: 1, id: Date.now() }]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <main className="min-h-screen bg-amber-50 text-amber-950">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-6xl">🥟</div>
          <div className="absolute top-40 right-20 text-4xl">🍛</div>
          <div className="absolute bottom-20 left-20 text-5xl">☕</div>
          <div className="absolute bottom-40 right-10 text-3xl">🥥</div>
          <div className="absolute top-60 left-1/3 text-4xl">🌿</div>
          <div className="absolute top-20 right-1/3 text-5xl">🧄</div>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-amber-900 mb-6">
              Masa Tina
            </h1>
            <p className="font-script text-2xl text-amber-700 mb-6 italic">
              "Como en casa, pero mejor"
            </p>
            <p className="text-xl text-amber-800 leading-relaxed mb-8 max-w-lg">
              Comida dominicana hecha en casa, para compartir donde quieras. 
              Cada plato lleva el sabor auténtico de nuestra tierra y el amor de nuestras manos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-semibold"
              >
                🍽️ Explorar el Menú
              </Button>
              <Button
                variant="outline" 
                size="lg"
                className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
              >
                📱 Pedir por WhatsApp
              </Button>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-amber-200 to-amber-300 rounded-3xl overflow-hidden border-4 border-amber-600/20 shadow-2xl">
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-8xl">🥘</span>
                </div>
                <div className="absolute top-4 right-4 bg-amber-600 text-amber-50 px-3 py-1 rounded-full text-sm font-bold">
                  Hecho en casa
                </div>
                <div className="absolute bottom-4 left-4 bg-green-600 text-green-50 px-3 py-1 rounded-full text-sm font-bold">
                  Ingredientes frescos
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-orange-500 text-white p-4 rounded-2xl shadow-lg"
            >
              <span className="text-2xl">🌶️</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-green-600 text-white p-4 rounded-2xl shadow-lg"
            >
              <span className="text-2xl">🥒</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-amber-50/90 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-serif text-2xl font-bold text-amber-900">Masa Tina</div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#menu" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                Menú
              </a>
              <a href="#suscripciones" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                Suscripciones
              </a>
              <a href="#experiencias" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                Experiencias
              </a>
              <a href="#nosotros" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                Nosotros
              </a>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-amber-700 text-amber-50 px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
              >
                🛒 Carrito ({cart.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-amber-100/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              Nuestro Menú
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto mb-8">
              Cada plato cuenta una historia. Desde las empanadas crujientes hasta los dulces que endulzan el alma.
            </p>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-amber-700 text-amber-50 shadow-lg'
                      : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Menu Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-200"
              >
                {/* Item Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center relative">
                  <span className="text-8xl opacity-70">
                    {item.category === "Combos" ? "🥟" :
                     item.category === "Catering" ? "🍛" :
                     item.category === "Desayunos" ? "🍳" :
                     item.category === "Postres" ? "🍮" :
                     item.category === "Experiencias" ? "☕" : "🥘"}
                  </span>
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-600 text-amber-50 px-3 py-1 rounded-full text-sm font-bold">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-green-50 px-3 py-1 rounded-full text-sm font-bold">
                      {item.serves}
                    </span>
                  </div>
                </div>

                {/* Item Content */}
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-bold text-amber-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-amber-700 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Items List */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2 text-sm">Incluye:</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {item.items.slice(0, 3).map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          {ingredient}
                        </li>
                      ))}
                      {item.items.length > 3 && (
                        <li className="text-amber-600 italic">+{item.items.length - 3} más...</li>
                      )}
                    </ul>
                  </div>

                  {/* Occasions */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {item.occasion.map((occ) => (
                        <span
                          key={occ}
                          className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between">
                    {item.price > 0 ? (
                      <span className="font-bold text-2xl text-amber-900">
                        ${item.price}
                      </span>
                    ) : (
                      <span className="font-bold text-lg text-amber-700">
                        Precio variable
                      </span>
                    )}
                    
                    <Button
                      variant="primary"
                      onClick={() => addToCart(item)}
                      disabled={item.price === 0}
                      className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                    >
                      {item.price > 0 ? "Agregar" : "Personalizar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscriptions Section */}
      <section id="suscripciones" className="py-24 bg-amber-200/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              Suscripciones
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Recibe el sabor de casa cada semana. Elige el plan que mejor se adapte a tu familia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  plan.popular ? 'border-amber-500 scale-105' : 'border-amber-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Más Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-serif text-2xl font-bold text-amber-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {plan.description}
                  </p>
                  <div className="text-4xl font-bold text-amber-900 mb-1">
                    ${plan.price}
                  </div>
                  <div className="text-amber-600 text-sm">
                    por semana
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-amber-800">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-amber-700 hover:bg-amber-800 text-amber-50' 
                      : 'border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50'
                  }`}
                >
                  Elegir Plan
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section id="experiencias" className="py-24 bg-amber-100/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              Experiencias Especiales
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Más que comida, creamos momentos. Únete a nuestros eventos y vive la cultura dominicana.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Club de Lectura Chocolate */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-amber-200"
            >
              <div className="text-6xl mb-4">📚☕</div>
              <h3 className="font-serif text-3xl font-bold text-amber-900 mb-4">
                Club de Lectura Chocolate
              </h3>
              <p className="text-amber-700 leading-relaxed mb-6">
                Cada último sábado del mes nos reunimos para discutir un libro mientras disfrutamos 
                de chocolate caliente dominicano y dulces tradicionales. Un espacio para el alma y el paladar.
              </p>
              <div className="mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">Próxima sesión:</h4>
                <p className="text-amber-700">Sábado 28 de Enero, 3:00 PM</p>
                <p className="text-amber-600">Libro: "La Mujer que Buceaba en los Sueños"</p>
              </div>
              <Button
                variant="primary"
                className="bg-amber-700 hover:bg-amber-800 text-amber-50"
              >
                Reservar mi lugar
              </Button>
            </motion.div>

            {/* Talleres de Cocina */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-amber-200"
            >
              <div className="text-6xl mb-4">👨‍🍳🥘</div>
              <h3 className="font-serif text-3xl font-bold text-amber-900 mb-4">
                Talleres de Cocina Dominicana
              </h3>
              <p className="text-amber-700 leading-relaxed mb-6">
                Aprende los secretos de la cocina dominicana directo de nuestras manos a las tuyas. 
                Talleres íntimos donde compartimos técnicas, historias y mucho sabor.
              </p>
              <div className="mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">Próximo taller:</h4>
                <p className="text-amber-700">Sábado 14 de Enero, 10:00 AM</p>
                <p className="text-amber-600">Tema: "El Arte del Mangú Perfecto"</p>
              </div>
              <Button
                variant="outline"
                className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
              >
                Inscribirse
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-amber-200/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              Historias de Nuestra Mesa
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Cada cliente es parte de nuestra familia extendida. Estas son sus palabras de amor.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl text-white mr-4">
                    👤
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900">{testimonial.name}</h4>
                    <p className="text-amber-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xl">⭐</span>
                  ))}
                </div>
                
                <blockquote className="text-amber-800 leading-relaxed italic">
                  "{testimonial.text}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section id="nosotros" className="py-24 bg-amber-100/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-6 text-lg text-amber-800 leading-relaxed">
                <p>
                  Masa Tina nació del amor por nuestra tierra y la nostalgia del sabor de casa. 
                  Desde Elmira, NY, llevamos el corazón de República Dominicana a cada mesa americana.
                </p>
                <p>
                  Somos una familia que cocina con las recetas de nuestras abuelas, pero con la 
                  frescura de ingredientes locales y la pasión de quien extraña su hogar.
                </p>
                <p className="font-semibold text-amber-900">
                  "Cada empanada es un abrazo, cada plato una historia, cada cliente un familiar más."
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-amber-300 to-orange-300 rounded-3xl overflow-hidden border-4 border-amber-600/20 shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👩‍🍳👨‍🍳</div>
                    <p className="text-amber-800 font-semibold">La Familia Masa Tina</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-amber-200/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              ¡Hablemos!
            </h2>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto mb-12">
              ¿Tienes una ocasión especial? ¿Quieres probar nuestros platos? 
              Contáctanos y hagamos magia culinaria juntos.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* WhatsApp */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-amber-200"
              >
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">WhatsApp</h3>
                <p className="text-amber-700 mb-6">
                  La forma más rápida de hacer tu pedido
                </p>
                <Button
                  variant="primary"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Chatear Ahora
                </Button>
              </motion.div>

              {/* Email */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-amber-200"
              >
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Email</h3>
                <p className="text-amber-700 mb-6">
                  Para eventos especiales y catering
                </p>
                <Button
                  variant="outline"
                  className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
                >
                  Enviar Email
                </Button>
              </motion.div>
            </div>

            {/* Newsletter */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-amber-200">
              <h3 className="font-serif text-2xl font-bold text-amber-900 mb-4">
                Newsletter Masa Tina
              </h3>
              <p className="text-amber-700 mb-6">
                Recibe recetas secretas, promociones exclusivas y noticias de nuestros eventos.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                />
                <Button
                  variant="primary"
                  className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                >
                  Suscribirse
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-amber-900 text-amber-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4">Masa Tina</h3>
              <p className="text-amber-200 leading-relaxed">
                Comida dominicana hecha con amor, desde nuestro hogar hasta el tuyo.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Síguenos</h4>
              <div className="flex gap-4">
                {[
                  { platform: "Instagram", emoji: "📷" },
                  { platform: "TikTok", emoji: "🎵" },
                  { platform: "Facebook", emoji: "👥" },
                  { platform: "YouTube", emoji: "📺" }
                ].map((social) => (
                  <a
                    key={social.platform}
                    href="#"
                    className="w-12 h-12 bg-amber-700 hover:bg-amber-600 rounded-full flex items-center justify-center text-xl transition-colors"
                  >
                    {social.emoji}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Ubicación</h4>
              <p className="text-amber-200">
                Elmira, NY<br />
                Servicio a toda la región<br />
                📞 (607) XXX-XXXX
              </p>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-amber-700">
            <p className="text-amber-300">
              © 2024 Masa Tina - Parte del ecosistema MaalCa ❤️
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Tu Carrito</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  ✕
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-amber-700 text-center py-8">Tu carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-amber-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-900">{item.name}</h4>
                          <p className="text-amber-700">${item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-amber-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-amber-900 mb-6">
                      <span>Total:</span>
                      <span>${getTotalPrice()}</span>
                    </div>
                    
                    <Button
                      variant="primary"
                      className="w-full bg-amber-700 hover:bg-amber-800 text-amber-50 mb-4"
                    >
                      Proceder al Pago
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
                    >
                      Pedir por WhatsApp
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}