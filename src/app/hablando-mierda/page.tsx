"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/buttons";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function HablandoMierdaPage() {
  const { t } = useTranslation();
  const [isLive, setIsLive] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const iconicPhrase = t('hbm.footer.phrase');

  const episodes = [
    {
      id: "ep-01",
      title: t('hbm.episode.01.title'),
      duration: "45 min",
      description: t('hbm.episode.01.description'),
      category: t('hbm.episodes.category.philosophy'),
      date: "2024-12-15",
      spotifyUrl: "#",
      image: "/images/hbm/episode-01.jpg"
    },
    {
      id: "ep-02",
      title: t('hbm.episode.02.title'),
      duration: "52 min",
      description: t('hbm.episode.02.description'),
      category: t('hbm.episodes.category.politics'),
      date: "2024-12-08",
      spotifyUrl: "#",
      image: "/images/hbm/episode-02.jpg"
    },
    {
      id: "ep-03",
      title: t('hbm.episode.03.title'),
      duration: "38 min",
      description: t('hbm.episode.03.description'),
      category: t('hbm.episodes.category.love'),
      date: "2024-12-01",
      spotifyUrl: "#",
      image: "/images/hbm/episode-03.jpg"
    },
    {
      id: "ep-04",
      title: t('hbm.episode.04.title'),
      duration: "41 min",
      description: t('hbm.episode.04.description'),
      category: t('hbm.episodes.category.culture'),
      date: "2024-11-24",
      spotifyUrl: "#",
      image: "/images/hbm/episode-04.jpg"
    }
  ];

  const hosts = [
    {
      name: t('hbm.hosts.ciri.name'),
      role: t('hbm.hosts.ciri.role'),
      description: t('hbm.hosts.ciri.description'),
      iconicPhrase: t('hbm.hosts.ciri.phrase'),
      avatar: "/images/hbm/ciri-avatar.svg",
      color: "#E50914"
    },
    {
      name: t('hbm.hosts.nolte.name'),
      role: t('hbm.hosts.nolte.role'),
      description: t('hbm.hosts.nolte.description'),
      iconicPhrase: t('hbm.hosts.nolte.phrase'),
      avatar: "/images/hbm/nolte-avatar.svg",
      color: "#FFD60A"
    }
  ];

  const clips = [
    {
      id: "clip-1",
      title: t('hbm.clips.01.title'),
      platform: "TikTok",
      views: "125K",
      url: "#"
    },
    {
      id: "clip-2",
      title: t('hbm.clips.02.title'),
      platform: "Instagram",
      views: "89K",
      url: "#"
    },
    {
      id: "clip-3",
      title: t('hbm.clips.03.title'),
      platform: "YouTube",
      views: "203K",
      url: "#"
    }
  ];

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
              <div
                key={i}
                className="absolute w-96 h-96 border border-brand-primary rounded-full animate-ping"
                style={{ animationDelay: `${i * 0.6}s`, animationDuration: "3s" }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="fade-in-up">
            {/* Logo Animado */}
            <div className="mb-8 animate-bounce" style={{ animationDuration: "4s" }}>
              <div className="text-9xl md:text-[12rem] font-black text-brand-primary mb-4 font-sans tracking-tighter">
                HBM
              </div>
              <div className="w-24 h-1 bg-brand-primary mx-auto mb-4" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-text-primary font-sans">
              {t('hbm.hero.title')}
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary mb-8 font-light max-w-3xl mx-auto">
              {t('hbm.hero.subtitle')}
              <br />
              <span className="text-brand-primary font-medium">{t('hbm.hero.tagline')}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <div className="hover-scale">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-8 py-4 text-lg"
                >
                  {t('hbm.hero.listenNow')}
                </Button>
              </div>

              <div className="hover-scale">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold px-8 py-4 text-lg"
                >
                  {t('hbm.hero.watchClips')}
                </Button>
              </div>
            </div>

            {/* Live Indicator */}
            {isLive && (
              <div className="scale-in inline-flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-full font-bold">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                {t('hbm.hero.liveNow')}
                <span className="text-sm opacity-90">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-brand-primary to-transparent rounded-full"></div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-black text-xl text-brand-primary hover-scale">
              HBM
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#episodios" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                {t('hbm.nav.episodes')}
              </a>
              <a href="#equipo" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                {t('hbm.nav.team')}
              </a>
              <a href="#clips" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                {t('hbm.nav.clips')}
              </a>
              <a href="#contacto" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
                {t('hbm.nav.contact')}
              </a>
              <LanguageToggle />
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </nav>

      {/* Episodios Section */}
      <section id="episodios" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              {t('hbm.episodes.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('hbm.episodes.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {episodes.map((episode, index) => (
              <div
                key={episode.id}
                className="fade-in-up group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
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
                        {t('hbm.episodes.play')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-text-secondary hover:bg-surface"
                      >
                        {t('hbm.episodes.spotify')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold"
            >
              {t('hbm.episodes.viewAll')}
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
              <div
                key={i}
                className="bg-brand-primary w-4 animate-pulse"
                style={{
                  height: `${20 + (i % 6) * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "2s"
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="scale-in">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-8 font-sans">
              {t('hbm.radio.title')}
            </h2>

            <div className="bg-surface-elevated rounded-3xl p-12 border border-border shadow-2xl">
              {/* Live Status */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div
                  className={`w-4 h-4 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
                />
                <span className="text-xl font-bold">
                  {isLive ? t('hbm.hero.transmittingNow') : t('hbm.hero.offAir')}
                </span>
                <div className="text-text-muted">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              {/* Wave Visualizer */}
              <div className="flex items-center justify-center gap-1 mb-8">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-t from-brand-primary to-brand-primary/50 w-3 rounded-full transition-all duration-300 ${isLive ? 'animate-pulse' : ''}`}
                    style={{
                      height: isLive ? `${20 + (i % 4) * 15}px` : '4px',
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "1.5s"
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
                {isLive ? t('hbm.radio.listenLive') : t('hbm.radio.nextTransmission')}
              </Button>

              {!isLive && (
                <p className="text-text-muted mt-4">
                  {t('hbm.hero.nextShow')}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Equipo Section */}
      <section id="equipo" className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              {t('hbm.hosts.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('hbm.hosts.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {hosts.map((host, index) => (
              <div
                key={host.name}
                className={`hover-scale group ${index === 0 ? 'fade-in-left' : 'fade-in-right'}`}
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

                  {/* Iconic Phrase */}
                  <div className="fade-in-up group-hover:bg-background/50 rounded-xl p-4 transition-all duration-300">
                    <blockquote
                      className="font-bold italic text-lg"
                      style={{ color: host.color }}
                    >
                      {host.iconicPhrase}
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clips Section */}
      <section id="clips" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              {t('hbm.clips.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('hbm.clips.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {clips.map((clip, index) => (
              <div
                key={clip.id}
                className="fade-in-up hover-scale group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border hover:border-brand-primary/50 transition-all duration-300">
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-brand-primary/30 to-surface flex items-center justify-center relative">
                    <div className="hover-scale w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-black border-y-[8px] border-y-transparent ml-1"></div>
                    </div>

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
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-background font-bold"
            >
              {t('hbm.clips.viewMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Support/Merch Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              {t('hbm.support.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('hbm.support.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { item: t('hbm.support.cap'), price: "$25", emoji: "🧢" },
              { item: t('hbm.support.tshirt'), price: "$35", emoji: "👕" },
              { item: t('hbm.support.stickers'), price: "$10", emoji: "🏷️" }
            ].map((product, index) => (
              <div
                key={product.item}
                className="fade-in-up hover-scale bg-surface-elevated rounded-2xl p-8 text-center border border-border hover:border-brand-primary/50 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-6xl mb-4">{product.emoji}</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{product.item}</h3>
                <div className="text-2xl font-black text-brand-primary mb-6">{product.price}</div>
                <div className="hover-scale">
                  <Button
                    variant="primary"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold"
                  >
                    {t('hbm.support.buy')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="hover-scale inline-block">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold px-12 py-4 text-xl"
              >
                {t('hbm.support.donate')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="fade-in-up">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-6 font-sans">
              {t('hbm.contact.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              {t('hbm.contact.subtitle')}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* WhatsApp */}
              <div className="hover-scale">
                <div className="bg-surface-elevated rounded-2xl p-8 border border-border hover:border-green-500/50 transition-all duration-300">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">{t('hbm.contact.whatsapp.title')}</h3>
                  <p className="text-text-secondary mb-6">
                    {t('hbm.contact.whatsapp.description')}
                  </p>
                  <Button
                    variant="primary"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                  >
                    {t('hbm.contact.whatsapp.button')}
                  </Button>
                </div>
              </div>

              {/* Discord */}
              <div className="hover-scale">
                <div className="bg-surface-elevated rounded-2xl p-8 border border-border hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">{t('hbm.contact.discord.title')}</h3>
                  <p className="text-text-secondary mb-6">
                    {t('hbm.contact.discord.description')}
                  </p>
                  <Button
                    variant="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                  >
                    {t('hbm.contact.discord.button')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6">
              {[
                { platform: "Instagram", emoji: "📷", color: "from-pink-500 to-purple-500" },
                { platform: "TikTok", emoji: "🎵", color: "from-black to-red-500" },
                { platform: "YouTube", emoji: "📺", color: "from-red-500 to-red-600" },
                { platform: "Spotify", emoji: "🎧", color: "from-green-400 to-green-500" }
              ].map((social) => (
                <a
                  key={social.platform}
                  href="#"
                  className={`hover-scale w-16 h-16 bg-gradient-to-br ${social.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {social.emoji}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Typewriter */}
      <footer className="py-16 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="fade-in">
            <div className="text-3xl md:text-4xl font-bold text-text-primary mb-4 font-mono">
              {typewriterText}
              <span className="text-brand-primary animate-pulse">|</span>
            </div>

            <div className="text-text-muted mt-8">
              <p>{t('hbm.footer.copyright')}</p>
              <p className="mt-2">{t('hbm.footer.location')}</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
