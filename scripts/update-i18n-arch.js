const fs = require('fs');
let c = fs.readFileSync('src/hooks/useSimpleLanguage.tsx', 'utf8');

// ── ES: new nav keys after nav.contact ───────────────────────────────────────
c = c.replace(
  `'nav.contact': 'Contacto',`,
  `'nav.contact': 'Contacto',    'nav.platform': 'Plataforma',    'nav.cases': 'Casos',    'nav.pricing': 'Precios',    'nav.docs': 'Docs',    'nav.ciriwhispers': 'CiriWhispers',`
);

// ── ES: beyond + editorial keys after cta.final.btn ─────────────────────────
c = c.replace(
  `'cta.final.btn': 'Crear mi cuenta gratis →',`,
  `'cta.final.btn': 'Crear mi cuenta gratis →',    'beyond.title': 'Más allá del software',    'beyond.subtitle': 'MaalCa también es una imprenta y una voz literaria.',    'beyond.editorial.title': 'Editorial MaalCa',    'beyond.editorial.desc': 'Publicamos libros sin que tengas que vender un riñón. Track asistido a $100 o publicación curada gratis.',    'beyond.editorial.cta': 'Conoce la editorial →',    'beyond.ciri.title': 'CiriWhispers',    'beyond.ciri.desc': 'El espacio literario del fundador. Narrativa, poesía y cartas. Escritura humana, sin algoritmos.',    'beyond.ciri.cta': 'Leer →',    'editorial.hero.eyebrow': 'Editorial independiente',    'editorial.hero.title': 'Publicar tu libro no debería costarte tus ahorros.',    'editorial.hero.subtitle': 'Tampoco debería depender de que alguien con poder te diga sí. En Editorial MaalCa hacemos las dos cosas: te ayudamos a publicar tu obra por un precio justo, o si nos atraviesa, la publicamos sin que pagues nada.',    'editorial.hero.cta.primary': 'Publica con nosotros — $100',    'editorial.hero.cta.secondary': 'Ver catálogo',    'editorial.tracks.title': 'Dos formas de publicar',    'editorial.track.assisted.title': 'Track Asistido',    'editorial.track.assisted.price': '$100 USD',    'editorial.track.assisted.subtitle': 'Para quien tiene la obra lista',    'editorial.track.curated.title': 'Track Curado',    'editorial.track.curated.price': 'Gratis',    'editorial.track.curated.subtitle': 'Para obras que nos atraviesan',    'editorial.tech.title': 'Tecnología que abarata. Curaduría que importa.',    'editorial.tech.ai.title': 'Lo que automatizamos',    'editorial.tech.human.title': 'Lo que NO automatizamos',    'casos.title': 'Implementaciones reales',    'casos.subtitle': 'Negocios reales. Resultados honestos.',    'casos.coming': 'Próximamente',    'casos.coming.desc': 'Estamos sumando nuevos negocios. Cada cliente es una historia real de implementación.',`
);

// ── EN: new nav keys ─────────────────────────────────────────────────────────
c = c.replace(
  `'nav.contact': 'Contact',`,
  `'nav.contact': 'Contact',    'nav.platform': 'Platform',    'nav.cases': 'Cases',    'nav.pricing': 'Pricing',    'nav.docs': 'Docs',    'nav.ciriwhispers': 'CiriWhispers',`
);

// ── EN: beyond + editorial keys ──────────────────────────────────────────────
c = c.replace(
  `'cta.final.btn': 'Create my free account →',`,
  `'cta.final.btn': 'Create my free account →',    'beyond.title': 'Beyond the software',    'beyond.subtitle': 'MaalCa is also a publisher and a literary voice.',    'beyond.editorial.title': 'Editorial MaalCa',    'beyond.editorial.desc': 'We publish books without you having to sell a kidney. Assisted track at $100 or curated publishing for free.',    'beyond.editorial.cta': 'Explore the editorial →',    'beyond.ciri.title': 'CiriWhispers',    'beyond.ciri.desc': 'The founder\\'s literary space. Fiction, poetry and letters. Human writing, no algorithms.',    'beyond.ciri.cta': 'Read →',    'editorial.hero.eyebrow': 'Independent editorial',    'editorial.hero.title': 'Publishing your book shouldn\\'t cost you your savings.',    'editorial.hero.subtitle': 'It also shouldn\\'t depend on someone with power saying yes. At Editorial MaalCa we do both: we help you publish at a fair price, or if it moves us, we publish it without charging you.',    'editorial.hero.cta.primary': 'Publish with us — $100',    'editorial.hero.cta.secondary': 'See catalog',    'editorial.tracks.title': 'Two ways to publish',    'editorial.track.assisted.title': 'Assisted Track',    'editorial.track.assisted.price': '$100 USD',    'editorial.track.assisted.subtitle': 'For those with a finished work',    'editorial.track.curated.title': 'Curated Track',    'editorial.track.curated.price': 'Free',    'editorial.track.curated.subtitle': 'For works that move us',    'editorial.tech.title': 'Technology that reduces cost. Curation that matters.',    'editorial.tech.ai.title': 'What we automate',    'editorial.tech.human.title': 'What we do NOT automate',    'casos.title': 'Real implementations',    'casos.subtitle': 'Real businesses. Honest results.',    'casos.coming': 'Coming soon',    'casos.coming.desc': 'We are adding more businesses. Every client is a real implementation story.',`
);

fs.writeFileSync('src/hooks/useSimpleLanguage.tsx', c, 'utf8');
console.log('i18n arch updated OK');
