import nodepub from 'nodepub';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createWorkingEPUB() {
  const publicDir = path.join(__dirname, '..', 'public', 'books');
  
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  console.log('📚 Creando EPUB funcional con nodepub...');

  // Crear el documento
  const document = nodepub.document({
    id: 'amaranta-demo-2024',
    title: 'Amaranta - Demo',
    author: 'Ciriaco A. Pichardo (CiriWhispers)',
    publisher: 'Editorial MaalCa',
    description: 'Una joven enfrenta el eco de una culpa heredada. Versión demo para CiriWhispers.',
    language: 'es',
    published: '2024-12-01',
    genre: 'Fiction',
    cover: null // No cover image
  }, path.join(publicDir, 'amaranta-working.epub'));

  // Agregar capítulos
  document.addSection('Introducción', `
    <h1>Amaranta - Demo</h1>
    <p><strong>Por Ciriaco A. Pichardo (CiriWhispers)</strong></p>
    <p><em>Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar también puede ser una forma de perdón.</em></p>
    <p>Esta es una versión demo creada especialmente para probar el lector digital integrado en CiriWhispers.</p>
    <hr/>
  `);

  document.addSection('Capítulo I: El Eco de una Culpa', `
    <h1>Capítulo I: El Eco de una Culpa</h1>
    
    <p>En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos, y cada rincón guardaba el eco de una culpa que se transmitía como herencia maldita.</p>
    
    <p>Era una tarde de octubre cuando todo cambió. El viento arrastraba las hojas secas por el patio, creando una sinfonía melancólica que parecía narrar su propia historia. Amaranta, de apenas diecisiete años, no sabía que ese día marcaría el inicio de su descenso hacia el laberinto de su propia consciencia.</p>
    
    <p>La carta llegó esa mañana, sellada con cera roja y con una caligrafía que le resultaba familiar pero que no lograba ubicar. Sus manos temblaron al abrirla, y las palabras que leyó la trasladaron a un pasado que creía enterrado.</p>
    
    <blockquote>
      <p><em>"Las deudas del alma se pagan con lágrimas, y las tuyas, querida Amaranta, apenas han comenzado a caer."</em></p>
    </blockquote>
    
    <p>No había firma, pero no la necesitaba. Sabía exactamente de quién venían esas palabras. La voz de su abuela resonaba en cada línea, como si desde el más allá le recordara que algunos fantasmas nunca descansan.</p>
    
    <p>La habitación se llenó de recuerdos. Veía a su abuela en la mecedora del porche, contándole historias de mujeres que amaron demasiado y pagaron el precio de su devoción. Historias que entonces le parecían cuentos, pero que ahora comprendía eran advertencias.</p>
    
    <p><em>"El amor verdadero"</em>, le había dicho la anciana una tarde, mientras tejía un chal que nunca terminaría, <em>"es como el fuego: puede darte calor o consumirte por completo. Y nosotras, las mujeres de esta familia, siempre hemos sido propensas a las llamas."</em></p>
  `);

  document.addSection('Capítulo II: Voces en el Silencio', `
    <h1>Capítulo II: Voces en el Silencio</h1>
    
    <p>Las noches se habían vuelto territorio de voces que nadie más podía escuchar. Amaranta despertaba sobresaltada, creyendo haber oído su nombre susurrado entre las sombras de su habitación.</p>
    
    <p>Era siempre la misma voz: grave, melancólica, cargada de una tristeza que parecía habitar en los rincones más oscuros de la casa. Una voz que conocía desde la infancia, pero que ahora la llamaba con una urgencia nueva, desesperada.</p>
    
    <p>Se levantaba de la cama y recorría los pasillos descalza, siguiendo el eco que la guiaba hacia el desván. Allí, entre cajas de recuerdos y muebles cubiertos por sábanas, encontraba siempre el mismo diario abierto en páginas diferentes.</p>
    
    <p>Era el diario de su madre, quien había muerto cuando ella apenas tenía cinco años. Las páginas amarillentas contenían confesiones que jamás debió leer, secretos que explicaban por qué su padre la miraba a veces con una mezcla de amor y dolor.</p>
    
    <blockquote>
      <p><em>"Hay amores que son condena, y yo he sido condenada a amar a quien no debía. Mi hija pagará por mis pecados, como yo pagué por los de mi madre, y su madre por los de la suya. Somos una estirpe de mujeres marcadas por la pasión ciega."</em></p>
    </blockquote>
    
    <p>Amaranta cerró el diario con manos temblorosas. Ahora entendía por qué las cartas, por qué las voces, por qué esa sensación constante de estar pagando una deuda que no había contraído.</p>
    
    <p>Pero había algo más. En la última página que había leído, su madre mencionaba un lugar: el viejo cementerio a las afueras del pueblo, donde estaba enterrada la primera Amaranta de la familia, aquella de quien había heredado el nombre y, aparentemente, la maldición.</p>
  `);

  document.addSection('Epílogo: El Perdón de las Almas', `
    <h1>Epílogo: El Perdón de las Almas</h1>
    
    <p>El viaje hacia el perdón no tiene mapa ni destino seguro. Amaranta lo aprendió esa madrugada de noviembre, cuando finalmente tuvo el valor de caminar hasta el cementerio y hablar con los fantasmas de su linaje.</p>
    
    <p>Bajo la luz pálida de la luna, encontró la tumba de la primera Amaranta. La lápida, erosionada por el tiempo, apenas dejaba leer: <em>"Amaranta Solís, 1892-1920. Amó como solo aman las almas perdidas."</em></p>
    
    <p>Se arrodilló sobre la tierra húmeda y, por primera vez en meses, habló en voz alta:</p>
    
    <blockquote>
      <p><em>"No sé qué hiciste, abuela. No sé qué hizo mi madre, ni mi bisabuela, ni todas las que vinieron antes. Pero yo estoy aquí, y estoy cansada de cargar con culpas que no son mías. Si el amor es nuestra maldición, que sea también nuestra redención."</em></p>
    </blockquote>
    
    <p>El viento dejó de soplar. Las voces callaron. Y por primera vez en su vida, Amaranta sintió el silencio no como una amenaza, sino como una promesa.</p>
    
    <p>Cuando regresó a casa, las cartas habían desaparecido del cajón. En su lugar, encontró una sola nota, escrita con su propia letra:</p>
    
    <blockquote>
      <p><strong>"El pasado perdona a quien aprende a perdonarse a sí mismo. El futuro espera a quien tiene el valor de escribir su propia historia."</strong></p>
    </blockquote>
    
    <p>Amaranta sonrió por primera vez en meses. La maldición había terminado, no porque alguien la hubiera roto, sino porque ella había decidido no heredarla.</p>
    
    <p>Algunas historias de amor terminan en tragedia. La suya, decidió, terminaría en libertad.</p>
    
    <hr/>
    <p style="text-align: center;"><strong>— Fin —</strong></p>
    <p style="text-align: center;"><em>Demo para CiriWhispers Digital Reader</em></p>
  `);

  // Escribir el archivo
  await document.writeEPUB((err) => {
    if (err) {
      console.error('❌ Error creating EPUB:', err);
    } else {
      console.log('✅ amaranta-working.epub creado exitosamente');
      console.log('📁 Ubicación: /public/books/amaranta-working.epub');
    }
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 2000); // Dar tiempo para que termine de escribir
  });
}

if (require.main === module) {
  createWorkingEPUB().catch(console.error);
}

module.exports = { createWorkingEPUB };