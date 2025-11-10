"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { useCart } from "@/hooks/useCart";
import { useWhatsAppContact } from "@/hooks/useWhatsAppContact";
import { useToast } from "@/hooks/useToast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { Toast } from "@/components/ui/Toast";
import { MobileMenu } from "@/components/masa-tina/MobileMenu";
import { CartSidebar } from "@/components/masa-tina/CartSidebar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

// Menu items with translation keys
const getMenuItems = (t: (key: string) => string) => [
  {
    id: "caja-picaderas",
    name: t("cocinatina.items.picaderas.name"),
    description: t("cocinatina.items.picaderas.description"),
    price: 45,
    image: "/images/masa-tina/caja-picaderas.jpg",
    category: "Combos",
    occasion: ["Reunión de amigos", "Merienda", "Oficina"],
    items: ["8 Empanadas mixtas", "6 Pastelitos de pollo", "4 Quipes", "4 Croquetas", "Salsas caseras"],
    serves: t("cocinatina.items.picaderas.serves")
  },
  {
    id: "mini-catering",
    name: t("cocinatina.items.catering.name"),
    description: t("cocinatina.items.catering.description"),
    price: 85,
    image: "/images/masa-tina/mini-catering.jpg",
    category: "Catering",
    occasion: ["Eventos", "Reunión de amigos"],
    items: ["Pollo guisado", "Arroz blanco", "Habichuelas rojas", "Ensalada verde", "Plátanos maduros", "Yuca hervida"],
    serves: t("cocinatina.items.catering.serves")
  },
  {
    id: "desayuno-dominicano",
    name: t("cocinatina.items.breakfast.name"),
    description: t("cocinatina.items.breakfast.description"),
    price: 25,
    image: "/images/masa-tina/desayuno.jpg",
    category: "Desayunos",
    occasion: ["Merienda"],
    items: ["Mangú de plátano verde", "Huevos fritos", "Salami dominicano", "Queso frito", "Cebollitas caramelizadas"],
    serves: t("cocinatina.items.breakfast.serves")
  },
  {
    id: "dulces-tradicionales",
    name: t("cocinatina.items.desserts.name"),
    description: t("cocinatina.items.desserts.description"),
    price: 30,
    image: "/images/masa-tina/dulces.jpg",
    category: "Postres",
    occasion: ["Merienda", "Eventos"],
    items: ["Majarete casero", "Tres golpes", "Flan de coco", "Dulce de leche cortada", "Galletas de jengibre"],
    serves: t("cocinatina.items.desserts.serves")
  },
  {
    id: "caja-personalizada",
    name: t("cocinatina.items.custom.name"),
    description: t("cocinatina.items.custom.description"),
    price: 0,
    image: "/images/masa-tina/personalizada.jpg",
    category: "Personalizado",
    occasion: ["Reunión de amigos", "Eventos", "Merienda", "Oficina"],
    items: ["Selecciona tus favoritos", "Mínimo 6 items", "Máximo 15 items"],
    serves: t("cocinatina.items.custom.serves")
  },
  {
    id: "cafe-tertulia",
    name: t("cocinatina.items.cafe.name"),
    description: t("cocinatina.items.cafe.description"),
    price: 35,
    image: "/images/masa-tina/cafe-tertulia.jpg",
    category: "Experiencias",
    occasion: ["Merienda"],
    items: ["Café dominicano especial", "Mini tres leches", "Pastelitos mixtos", "Galletas artesanales", "Conversación incluida"],
    serves: t("cocinatina.items.cafe.serves")
  }
];

// Subscription plans with translation keys
const getSubscriptionPlans = (t: (key: string) => string) => [
  {
    id: "basico",
    name: t("cocinatina.plans.basic.name"),
    description: t("cocinatina.plans.basic.description"),
    price: 40,
    frequency: "semanal",
    items: ["1 Caja de picaderas", "Variedad rotativa", "Entrega gratuita"],
    popular: false
  },
  {
    id: "familiar",
    name: t("cocinatina.plans.family.name"),
    description: t("cocinatina.plans.family.description"),
    price: 70,
    frequency: "semanal",
    items: ["1 Mini catering", "1 Caja de dulces", "Menú personalizable", "Entrega premium"],
    popular: true
  },
  {
    id: "premium",
    name: t("cocinatina.plans.premium.name"),
    description: t("cocinatina.plans.premium.description"),
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
    text: "La comida sabe exactamente como la hacía mi abuela en Santiago. Cocina Tina me transporta a casa con cada bocado.",
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
  // State
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Hooks
  const {
    cart,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();

  const {
    sendOrderMessage,
    sendCartMessage,
    sendInquiry,
    sendSubscriptionMessage,
    sendEventMessage,
  } = useWhatsAppContact();

  const { toasts, success, error, remove: removeToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();

  // Get translated data
  const menuItems = getMenuItems(t);
  const subscriptionPlans = getSubscriptionPlans(t);

  const categories = [
    { key: "Todos", label: t("cocinatina.menu.categories.all") },
    { key: "Combos", label: t("cocinatina.menu.categories.combos") },
    { key: "Catering", label: t("cocinatina.menu.categories.catering") },
    { key: "Desayunos", label: t("cocinatina.menu.categories.breakfast") },
    { key: "Postres", label: t("cocinatina.menu.categories.desserts") },
    { key: "Experiencias", label: t("cocinatina.menu.categories.experiences") }
  ];
  const occasions = ["Reunión de amigos", "Eventos", "Merienda", "Oficina"];

  const filteredItems = selectedCategory === "Todos"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // Add to cart with toast notification
  const handleAddToCart = (item: any) => {
    if (item.price === 0) {
      error("Por favor contacta para personalizar este producto");
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });

    success(`${item.name} agregado al carrito! 🎉`);
  };

  // WhatsApp cart checkout
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) {
      error("El carrito está vacío");
      return;
    }

    sendCartMessage(cart, getTotal());
    setShowCart(false);
  };

  // Toggle expanded items
  const toggleExpandItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
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
              {t("cocinatina.hero.title")}
            </h1>
            <p className="font-script text-2xl text-amber-700 mb-6 italic">
              {t("cocinatina.hero.tagline")}
            </p>
            <p className="text-xl text-amber-800 leading-relaxed mb-8 max-w-lg">
              {t("cocinatina.hero.description")} 
              Cada plato lleva el sabor auténtico de nuestra tierra y el amor de nuestras manos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-semibold"
              >
                🍽️ {t("cocinatina.menu.exploreMenu")}
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
                  {t("cocinatina.hero.badge.homemade")}
                </div>
                <div className="absolute bottom-4 left-4 bg-green-600 text-green-50 px-3 py-1 rounded-full text-sm font-bold">
                  {t("cocinatina.hero.badge.fresh")}
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
            <div className="font-serif text-2xl font-bold text-amber-900">{t("cocinatina.hero.title")}</div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#menu" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                {t("cocinatina.nav.menu")}
              </a>
              <a href="#suscripciones" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                {t("cocinatina.nav.subscriptions")}
              </a>
              <a href="#experiencias" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                {t("cocinatina.nav.experiences")}
              </a>
              <a href="#nosotros" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">
                {t("cocinatina.nav.about")}
              </a>
              <LanguageToggle />
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-amber-700 text-amber-50 px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
                aria-label={`${t("cocinatina.nav.cart")} - ${getItemCount()} items`}
              >
                🛒 {t("cocinatina.nav.cart")} ({getItemCount()})
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
              {t("cocinatina.menu.title")}
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto mb-8">
              Cada plato cuenta una historia. Desde las empanadas crujientes hasta los dulces que endulzan el alma.
            </p>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category.key
                      ? 'bg-amber-700 text-amber-50 shadow-lg'
                      : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                  }`}
                >
                  {category.label}
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
                    <h4 className="font-semibold text-amber-800 mb-2 text-sm">{t("cocinatina.menu.includes")}</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {(expandedItems.has(item.id) ? item.items : item.items.slice(0, 3)).map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          {ingredient}
                        </li>
                      ))}
                      {item.items.length > 3 && (
                        <li>
                          <button
                            onClick={() => toggleExpandItem(item.id)}
                            className="text-amber-600 hover:text-amber-800 italic font-medium transition-colors underline cursor-pointer"
                            aria-label={expandedItems.has(item.id) ? "Ver menos items" : `Ver ${item.items.length - 3} items más`}
                          >
                            {expandedItems.has(item.id)
                              ? t("cocinatina.menu.seeLess")
                              : `+${item.items.length - 3} ${t("cocinatina.menu.seeMore")}`}
                          </button>
                        </li>
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
                      onClick={() => item.price > 0 ? handleAddToCart(item) : sendOrderMessage(item.name, 0, "Quiero personalizar este producto")}
                      className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                      aria-label={item.price > 0 ? `${t("cocinatina.menu.add")} ${item.name}` : `${t("cocinatina.menu.customize")} ${item.name}`}
                    >
                      {item.price > 0 ? `${t("cocinatina.menu.add")} 🛒` : `${t("cocinatina.menu.customize")} 📱`}
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
              {t("cocinatina.subscriptions.title")}
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              {t("cocinatina.subscriptions.subtitle")}
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
                    {t("cocinatina.subscriptions.popular")}
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
                    {t("cocinatina.menu.perWeek")}
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
                  onClick={() => sendSubscriptionMessage(plan.name, plan.price)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-amber-700 hover:bg-amber-800 text-amber-50'
                      : 'border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50'
                  }`}
                  aria-label={`${t("cocinatina.subscriptions.choosePlan")} ${plan.name}`}
                >
                  {t("cocinatina.subscriptions.choosePlan")} 📱
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
              {t("cocinatina.experiences.title")}
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              {t("cocinatina.experiences.subtitle")}
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
                {t("cocinatina.experiences.bookClub.title")}
              </h3>
              <p className="text-amber-700 leading-relaxed mb-6">
                {t("cocinatina.experiences.bookClub.description")}
              </p>
              <div className="mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">{t("cocinatina.experiences.bookClub.nextSession")}</h4>
                <p className="text-amber-700">{t("cocinatina.experiences.bookClub.date")}</p>
                <p className="text-amber-600">{t("cocinatina.experiences.bookClub.book")}</p>
              </div>
              <Button
                variant="primary"
                onClick={() => sendEventMessage("Club de Lectura Chocolate", "Sábado 28 de Enero, 3:00 PM")}
                className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                aria-label="Reservar lugar en Club de Lectura Chocolate"
              >
                {t("cocinatina.experiences.bookClub.reserve")}
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
                {t("cocinatina.experiences.workshop.title")}
              </h3>
              <p className="text-amber-700 leading-relaxed mb-6">
                {t("cocinatina.experiences.workshop.description")}
              </p>
              <div className="mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">{t("cocinatina.experiences.workshop.nextWorkshop")}</h4>
                <p className="text-amber-700">{t("cocinatina.experiences.workshop.date")}</p>
                <p className="text-amber-600">{t("cocinatina.experiences.workshop.topic")}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => sendEventMessage("Taller: El Arte del Mangú Perfecto", "Sábado 14 de Enero, 10:00 AM")}
                className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
                aria-label="Inscribirse en Taller de Cocina"
              >
                {t("cocinatina.experiences.workshop.register")}
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
              {t("cocinatina.testimonials.title")}
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              {t("cocinatina.testimonials.subtitle")}
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
                {t("cocinatina.about.title")}
              </h2>
              <div className="space-y-6 text-lg text-amber-800 leading-relaxed">
                <p>
                  {t("cocinatina.about.paragraph1")}
                </p>
                <p>
                  {t("cocinatina.about.paragraph2")}
                </p>
                <p className="font-semibold text-amber-900">
                  {t("cocinatina.about.quote")}
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
                    <p className="text-amber-800 font-semibold">{t("cocinatina.about.familyLabel")}</p>
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
              {t("cocinatina.contact.title")}
            </h2>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto mb-12">
              {t("cocinatina.contact.subtitle")}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* WhatsApp */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-amber-200"
              >
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">{t("cocinatina.contact.whatsapp.title")}</h3>
                <p className="text-amber-700 mb-6">
                  {t("cocinatina.contact.whatsapp.description")}
                </p>
                <Button
                  variant="primary"
                  onClick={() => sendInquiry("Consulta General", "Hola, me gustaría obtener más información sobre sus productos y servicios.")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  aria-label="Chatear por WhatsApp"
                >
                  {t("cocinatina.contact.whatsapp.button")}
                </Button>
              </motion.div>

              {/* Email */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-amber-200"
              >
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">{t("cocinatina.contact.email.title")}</h3>
                <p className="text-amber-700 mb-6">
                  {t("cocinatina.contact.email.description")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => sendInquiry("Evento Especial o Catering", "Me gustaría cotizar un evento especial.")}
                  className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-amber-50"
                  aria-label="Contactar para eventos"
                >
                  {t("cocinatina.contact.email.button")}
                </Button>
              </motion.div>
            </div>

            {/* Newsletter */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-amber-200">
              <h3 className="font-serif text-2xl font-bold text-amber-900 mb-4">
                {t("cocinatina.newsletter.title")}
              </h3>
              <p className="text-amber-700 mb-6">
                {t("cocinatina.newsletter.description")}
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t("cocinatina.newsletter.placeholder")}
                  className="flex-1 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                />
                <Button
                  variant="primary"
                  className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                >
                  {t("cocinatina.newsletter.button")}
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
              <h3 className="font-serif text-2xl font-bold mb-4">{t("cocinatina.hero.title")}</h3>
              <p className="text-amber-200 leading-relaxed">
                {t("cocinatina.footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t("cocinatina.footer.follow")}</h4>
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
              <h4 className="font-bold mb-4">{t("cocinatina.footer.location")}</h4>
              <p className="text-amber-200">
                {t("cocinatina.footer.locationText")}<br />
                {t("cocinatina.footer.service")}<br />
                📞 (607) XXX-XXXX
              </p>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-amber-700">
            <p className="text-amber-300">
              {t("cocinatina.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        cartCount={getItemCount()}
        onCartClick={() => setShowCart(true)}
        onWhatsAppClick={() => sendInquiry("Consulta", "Hola, me gustaría obtener más información.")}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onRemoveItem={removeItem}
        onIncrementQuantity={incrementQuantity}
        onDecrementQuantity={decrementQuantity}
        onClearCart={clearCart}
        onWhatsAppCheckout={handleWhatsAppCheckout}
        getTotal={getTotal}
      />
    </main>
  );
}