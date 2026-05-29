const fs = require('fs');
let c = fs.readFileSync('src/hooks/useSimpleLanguage.tsx', 'utf8');

// ── ES ────────────────────────────────────────────────────────────────────────
// Remove hardcoded $100 from editorial.hero.cta.primary
c = c.replace(
  `'editorial.hero.cta.primary': 'Publica con nosotros — $100',`,
  `'editorial.hero.cta.primary': 'Publica con nosotros',`
);
// Remove price from beyond.editorial.desc — keep tagline, drop number
c = c.replace(
  `'beyond.editorial.desc': 'Publicamos libros sin que tengas que vender un riñón. Track asistido a $100 o publicación curada gratis.',`,
  `'beyond.editorial.desc': 'Publicamos libros con un precio justo, o gratis si la obra nos atraviesa.',`
);

// ── EN ────────────────────────────────────────────────────────────────────────
c = c.replace(
  `'editorial.hero.cta.primary': 'Publish with us — $100',`,
  `'editorial.hero.cta.primary': 'Publish with us',`
);
c = c.replace(
  `'beyond.editorial.desc': 'We publish books without you having to sell a kidney. Assisted track at $100 or curated publishing for free.',`,
  `'beyond.editorial.desc': 'We publish books at a fair price, or free if the work moves us.',`
);

fs.writeFileSync('src/hooks/useSimpleLanguage.tsx', c, 'utf8');
console.log('fix1 i18n price updated');
