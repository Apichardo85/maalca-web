"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import Link from "next/link";

export default function CiriSonicPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setParticleAnimation] = useState(0);

  // Services data - now using translation keys
  const services = [
    {
      id: "text-ai",
      icon: "✍️",
      titleKey: "cirisonic.service.text.title",
      subtitleKey: "cirisonic.service.text.subtitle",
      descriptionKey: "cirisonic.service.text.description",
      featureKeys: [
        "cirisonic.service.text.feature1",
        "cirisonic.service.text.feature2",
        "cirisonic.service.text.feature3",
        "cirisonic.service.text.feature4"
      ],
      color: "blue",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      id: "image-ai",
      icon: "🎨",
      titleKey: "cirisonic.service.image.title",
      subtitleKey: "cirisonic.service.image.subtitle",
      descriptionKey: "cirisonic.service.image.description",
      featureKeys: [
        "cirisonic.service.image.feature1",
        "cirisonic.service.image.feature2",
        "cirisonic.service.image.feature3",
        "cirisonic.service.image.feature4"
      ],
      color: "purple",
      gradient: "from-purple-500 to-pink-400"
    },
    {
      id: "audio-ai",
      icon: "🎧",
      titleKey: "cirisonic.service.audio.title",
      subtitleKey: "cirisonic.service.audio.subtitle",
      descriptionKey: "cirisonic.service.audio.description",
      featureKeys: [
        "cirisonic.service.audio.feature1",
        "cirisonic.service.audio.feature2",
        "cirisonic.service.audio.feature3",
        "cirisonic.service.audio.feature4"
      ],
      color: "emerald",
      gradient: "from-emerald-500 to-teal-400"
    },
    {
      id: "video-ai",
      icon: "🎬",
      titleKey: "cirisonic.service.video.title",
      subtitleKey: "cirisonic.service.video.subtitle",
      descriptionKey: "cirisonic.service.video.description",
      featureKeys: [
        "cirisonic.service.video.feature1",
        "cirisonic.service.video.feature2",
        "cirisonic.service.video.feature3",
        "cirisonic.service.video.feature4"
      ],
      color: "orange",
      gradient: "from-orange-500 to-red-400"
    }
  ];

  const useCases = [
    {
      titleKey: "cirisonic.useCase.startups.title",
      descriptionKey: "cirisonic.useCase.startups.description",
      icon: "🚀",
      benefitKeys: [
        "cirisonic.useCase.startups.benefit1",
        "cirisonic.useCase.startups.benefit2",
        "cirisonic.useCase.startups.benefit3",
        "cirisonic.useCase.startups.benefit4"
      ]
    },
    {
      titleKey: "cirisonic.useCase.creators.title",
      descriptionKey: "cirisonic.useCase.creators.description",
      icon: "✨",
      benefitKeys: [
        "cirisonic.useCase.creators.benefit1",
        "cirisonic.useCase.creators.benefit2",
        "cirisonic.useCase.creators.benefit3",
        "cirisonic.useCase.creators.benefit4"
      ]
    },
    {
      titleKey: "cirisonic.useCase.pymes.title",
      descriptionKey: "cirisonic.useCase.pymes.description",
      icon: "🎯",
      benefitKeys: [
        "cirisonic.useCase.pymes.benefit1",
        "cirisonic.useCase.pymes.benefit2",
        "cirisonic.useCase.pymes.benefit3",
        "cirisonic.useCase.pymes.benefit4"
      ]
    },
    {
      titleKey: "cirisonic.useCase.corporate.title",
      descriptionKey: "cirisonic.useCase.corporate.description",
      icon: "📊",
      benefitKeys: [
        "cirisonic.useCase.corporate.benefit1",
        "cirisonic.useCase.corporate.benefit2",
        "cirisonic.useCase.corporate.benefit3",
        "cirisonic.useCase.corporate.benefit4"
      ]
    }
  ];

  const pricingPlans = [
    {
      nameKey: "cirisonic.pricing.starter.name",
      priceKey: "cirisonic.pricing.starter.price",
      periodKey: "cirisonic.pricing.starter.period",
      descriptionKey: "cirisonic.pricing.starter.description",
      featureKeys: [
        "cirisonic.pricing.starter.feature1",
        "cirisonic.pricing.starter.feature2",
        "cirisonic.pricing.starter.feature3",
        "cirisonic.pricing.starter.feature4",
        "cirisonic.pricing.starter.feature5",
        "cirisonic.pricing.starter.feature6"
      ],
      available: true,
      popular: false
    },
    {
      nameKey: "cirisonic.pricing.pro.name",
      priceKey: "cirisonic.pricing.pro.price",
      periodKey: "cirisonic.pricing.pro.period",
      descriptionKey: "cirisonic.pricing.pro.description",
      featureKeys: [
        "cirisonic.pricing.pro.feature1",
        "cirisonic.pricing.pro.feature2",
        "cirisonic.pricing.pro.feature3",
        "cirisonic.pricing.pro.feature4",
        "cirisonic.pricing.pro.feature5",
        "cirisonic.pricing.pro.feature6",
        "cirisonic.pricing.pro.feature7",
        "cirisonic.pricing.pro.feature8"
      ],
      available: false,
      popular: true
    },
    {
      nameKey: "cirisonic.pricing.enterprise.name",
      priceKey: "cirisonic.pricing.enterprise.price",
      periodKey: "cirisonic.pricing.enterprise.period",
      descriptionKey: "cirisonic.pricing.enterprise.description",
      featureKeys: [
        "cirisonic.pricing.enterprise.feature1",
        "cirisonic.pricing.enterprise.feature2",
        "cirisonic.pricing.enterprise.feature3",
        "cirisonic.pricing.enterprise.feature4",
        "cirisonic.pricing.enterprise.feature5",
        "cirisonic.pricing.enterprise.feature6",
        "cirisonic.pricing.enterprise.feature7"
      ],
      available: false,
      popular: false
    }
  ];

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
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${6 + i * 0.5}s`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/50 to-purple-950/30" />
        </div>


        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="fade-in-up">
            {/* Futuristic Logo */}
            <div className="mb-8 hover-scale">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center border-2 border-cyan-400/30 shadow-2xl shadow-blue-500/30 backdrop-blur-sm">
                <span className="text-5xl">🤖</span>
              </div>
            </div>

            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight fade-in-up delay-300"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                {t('cirisonic.hero.title')}
              </span>
            </h1>

            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-light mb-8 text-gray-300 fade-in delay-600"
            >
              {t('cirisonic.hero.subtitle')}
            </h2>

            <p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed fade-in delay-600"
            >
              {t('cirisonic.hero.description.part1')} <span className="text-cyan-400 font-semibold">{t('cirisonic.hero.description.strategy')}</span> {t('cirisonic.hero.description.and')}
              <span className="text-purple-400 font-semibold"> {t('cirisonic.hero.description.engagement')}</span>
            </p>

            <div
              className="flex flex-col sm:flex-row gap-6 justify-center fade-in-up delay-800"
            >
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-xl border-0 shadow-lg shadow-blue-500/25"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🚀 {t('cirisonic.hero.button.demo')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold px-12 py-4 text-xl"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('cirisonic.hero.button.features')}
              </Button>
            </div>

            {/* Floating Stats */}
            <div
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto fade-in-up delay-800"
            >
              {[
                { valueKey: "cirisonic.hero.stat1.value", labelKey: "cirisonic.hero.stat1.label" },
                { valueKey: "cirisonic.hero.stat2.value", labelKey: "cirisonic.hero.stat2.label" },
                { valueKey: "cirisonic.hero.stat3.value", labelKey: "cirisonic.hero.stat3.label" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    {t(stat.valueKey)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {t(stat.labelKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-400 animate-bounce"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-medium">{t('cirisonic.hero.scroll')}</span>
            <div className="w-0.5 h-16 bg-gradient-to-b from-blue-400 to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {t('cirisonic.hero.title')}
            </span>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                {t('cirisonic.nav.services')}
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                {t('cirisonic.nav.howItWorks')}
              </a>
              <a href="#demo" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                {t('cirisonic.nav.demo')}
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                {t('cirisonic.nav.pricing')}
              </a>
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                {t('cirisonic.nav.requestDemo')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Services Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="text-center mb-20 fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.services.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('cirisonic.services.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 shadow-lg backdrop-blur-sm hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`text-6xl bg-gradient-to-r ${service.gradient} bg-clip-text`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                        {t(service.titleKey)}
                      </h3>
                      <p className={`text-sm font-medium text-${service.color}-400 mb-4`}>
                        {t(service.subtitleKey)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                    {t(service.descriptionKey)}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {service.featureKeys.map((featureKey, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span className="text-green-400">✓</span>
                        <span>{t(featureKey)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Button
                      variant="outline"
                      className={`border-2 border-${service.color}-500 text-${service.color}-400 hover:bg-${service.color}-500 hover:text-white font-medium`}
                    >
                      {t('cirisonic.services.viewDemo')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div
            className="text-center mb-20 fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('cirisonic.howItWorks.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-30"></div>

            {[
              {
                step: "1",
                titleKey: "cirisonic.howItWorks.step1.title",
                descriptionKey: "cirisonic.howItWorks.step1.description",
                icon: "🎯",
                color: "blue"
              },
              {
                step: "2",
                titleKey: "cirisonic.howItWorks.step2.title",
                descriptionKey: "cirisonic.howItWorks.step2.description",
                icon: "🎨",
                color: "purple"
              },
              {
                step: "3",
                titleKey: "cirisonic.howItWorks.step3.title",
                descriptionKey: "cirisonic.howItWorks.step3.description",
                icon: "🚀",
                color: "cyan"
              },
              {
                step: "4",
                titleKey: "cirisonic.howItWorks.step4.title",
                descriptionKey: "cirisonic.howItWorks.step4.description",
                icon: "📊",
                color: "green"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="relative text-center fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Step Number */}
                <div
                  className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-${item.color}-500/30 relative z-10 hover-scale`}
                >
                  {item.step}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4">
                  {item.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t(item.titleKey)}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t(item.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Mockup Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="text-center mb-16 fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.dashboard.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('cirisonic.dashboard.description')}
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div
            className="relative max-w-6xl mx-auto fade-in-up"
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
                  <h3 className="text-2xl font-bold text-white mb-2">{t('cirisonic.dashboard.greeting')} 👋</h3>
                  <p className="text-gray-400">{t('cirisonic.dashboard.pendingProjects')}</p>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    {t('cirisonic.dashboard.createContent')}
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[
                  { titleKey: "cirisonic.dashboard.stat.engagement", value: "+247%", icon: "📈", color: "green" },
                  { titleKey: "cirisonic.dashboard.stat.contentCreated", value: "1,284", icon: "🎨", color: "blue" },
                  { titleKey: "cirisonic.dashboard.stat.totalReach", value: "94.2K", icon: "🌎", color: "purple" },
                  { titleKey: "cirisonic.dashboard.stat.avgROI", value: "435%", icon: "💰", color: "yellow" }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-${stat.color}-500/50 transition-all hover-scale`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{stat.icon}</span>
                      <span className={`text-${stat.color}-400 text-sm font-medium`}>↗</span>
                    </div>
                    <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {t(stat.titleKey)}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Tools Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    titleKey: "cirisonic.dashboard.tool.generateText.title",
                    descriptionKey: "cirisonic.dashboard.tool.generateText.description",
                    icon: "✍️",
                    statusKey: "cirisonic.dashboard.tool.generateText.status",
                    color: "blue"
                  },
                  {
                    titleKey: "cirisonic.dashboard.tool.createReel.title",
                    descriptionKey: "cirisonic.dashboard.tool.createReel.description",
                    icon: "🎬",
                    statusKey: "cirisonic.dashboard.tool.createReel.status",
                    color: "purple"
                  },
                  {
                    titleKey: "cirisonic.dashboard.tool.voiceOver.title",
                    descriptionKey: "cirisonic.dashboard.tool.voiceOver.description",
                    icon: "🎧",
                    statusKey: "cirisonic.dashboard.tool.voiceOver.status",
                    color: "emerald"
                  }
                ].map((tool, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="text-4xl mb-4">{tool.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-2">{t(tool.titleKey)}</h4>
                    <p className="text-gray-400 text-sm mb-4">{t(tool.descriptionKey)}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs bg-${tool.color}-500/20 text-${tool.color}-400 px-3 py-1 rounded-full`}>
                        {t(tool.statusKey)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-${tool.color}-500 text-${tool.color}-400 hover:bg-${tool.color}-500 hover:text-white text-xs`}
                      >
                        {t('cirisonic.dashboard.tool.use')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-30 -z-10"></div>
          </div>

          {/* CTA */}
          <div
            className="text-center mt-16 fade-in-up"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-xl border-0 shadow-lg shadow-blue-500/25"
            >
              🚀 {t('cirisonic.dashboard.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="text-center mb-20 fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.useCases.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('cirisonic.useCases.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 text-center hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="text-6xl mb-6">{useCase.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                    {t(useCase.titleKey)}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {t(useCase.descriptionKey)}
                  </p>

                  <div className="space-y-3">
                    {useCase.benefitKeys.map((benefitKey, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-green-400">✓</span>
                        <span>{t(benefitKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div
            className="text-center mb-20 fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('cirisonic.pricing.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative fade-in-up ${plan.popular ? 'scale-105' : ''}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 border-2 transition-all duration-500 ${
                  plan.popular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-gray-700/50 hover:border-blue-500/50'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                        {t('cirisonic.pricing.popular')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {t(plan.nameKey)}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {t(plan.descriptionKey)}
                    </p>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      {t(plan.priceKey)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {t(plan.periodKey)}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.featureKeys.map((featureKey, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                        <span className="text-gray-300">{t(featureKey)}</span>
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
                    {plan.available ? `${t('cirisonic.pricing.button.choose')} ${t(plan.nameKey)}` : t('cirisonic.pricing.button.comingSoon')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className="fade-in-up"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {t('cirisonic.leadCapture.title')}
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('cirisonic.leadCapture.description')}
            </p>

            {/* Email Capture Form */}
            <div
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-12 border border-gray-700/50 backdrop-blur-sm max-w-2xl mx-auto hover-scale"
            >
              <div className="text-6xl mb-8">🚀</div>
              <h3 className="text-3xl font-bold text-white mb-6">
                {t('cirisonic.leadCapture.cardTitle')}
              </h3>
              <p className="text-gray-400 mb-8">
                {t('cirisonic.leadCapture.cardDescription')}
              </p>

              {!isSubmitted ? (
                <form
                  onSubmit={handleEmailSubmit}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('cirisonic.leadCapture.emailPlaceholder')}
                      required
                      className="flex-1 px-6 py-4 bg-gray-900 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-lg"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg border-0 whitespace-nowrap"
                    >
                      {t('cirisonic.leadCapture.button')}
                    </Button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {t('cirisonic.leadCapture.disclaimer')}
                  </p>
                </form>
              ) : (
                <div
                  className="text-center scale-in"
                >
                  <div className="text-6xl mb-6">✨</div>
                  <h4 className="text-2xl font-bold text-green-400 mb-4">
                    {t('cirisonic.leadCapture.success.title')}
                  </h4>
                  <p className="text-gray-400">
                    {t('cirisonic.leadCapture.success.message')}
                  </p>
                </div>
              )}
            </div>

            {/* Social Proof */}
            <div
              className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto fade-in-up"
            >
              {[
                { count: "500+", labelKey: "cirisonic.leadCapture.proof.waitlist" },
                { count: "50+", labelKey: "cirisonic.leadCapture.proof.betaTesters" },
                { count: "98%", labelKey: "cirisonic.leadCapture.proof.satisfaction" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    {item.count}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {t(item.labelKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                {t('cirisonic.hero.title')}
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                {t('cirisonic.footer.description')}
              </p>
              <div className="text-gray-500 text-sm">
                <p className="mb-2">🤖 {t('cirisonic.footer.aiResponsible')}</p>
                <p>⚡ {t('cirisonic.footer.ethicalContent')}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">{t('cirisonic.footer.product')}</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="#features" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.services')}</a>
                <a href="#how-it-works" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.howItWorks')}</a>
                <a href="#pricing" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.pricing')}</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.apiDocs')}</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">{t('cirisonic.footer.ecosystem')}</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="/" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.maalcaHome')}</a>
                <a href="/ciriwhispers" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.ciriwhispers')}</a>
                <a href="/hablando-mierda" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.hablandoMierda')}</a>
                <a href="/masa-tina" className="block hover:text-blue-400 transition-colors">{t('cirisonic.footer.masaTina')}</a>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-2">
              {t('cirisonic.footer.copyright')}
            </p>
            <p className="text-gray-600 text-xs italic">
              {t('cirisonic.footer.tagline')}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <div
        className="fixed bottom-6 right-6 z-50 scale-in"
      >
        <Button
          onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300 border-0"
        >
          🚀
        </Button>
      </div>
    </main>
  );
}
