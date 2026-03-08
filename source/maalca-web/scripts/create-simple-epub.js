import EPub from "epub-gen-memory";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSimpleEPUB() {
  const publicDir = path.join(__dirname, "..", "public", "books");
  
  // Crear directorio si no existe
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  console.log("📚 Creando EPUB de ejemplo...");

  const content = [
    {
      title: "Capítulo 1: El Inicio",
      content: `
        <h1>Capítulo 1: El Inicio</h1>
        
        <p>En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos, y cada rincón guardaba el eco de una culpa que se transmitía como herencia maldita.</p>
        
        <p>Era una tarde de octubre cuando todo cambió. El viento arrastraba las hojas secas por el patio, creando una sinfonía melancólica que parecía narrar su propia historia. Amaranta, de apenas diecisiete años, no sabía que ese día marcaría el inicio de su descenso hacia el laberinto de su propia consciencia.</p>
        
        <p>La carta llegó esa mañana, sellada con cera roja y con una caligrafía que le resultaba familiar pero que no lograba ubicar. Sus manos temblaron al abrirla, y las palabras que leyó la trasladaron a un pasado que creía enterrado.</p>
        
        <blockquote>
          <p style="font-style: italic; margin: 20px; padding: 10px; border-left: 3px solid #ccc;">"Las deudas del alma se pagan con lágrimas, y las tuyas, querida Amaranta, apenas han comenzado a caer."</p>
        </blockquote>
        
        <p>No había firma, pero no la necesitaba. Sabía exactamente de quién venían esas palabras. La voz de su abuela resonaba en cada línea, como si desde el más allá le recordara que algunos fantasmas nunca descansan.</p>
      `
    },
    {
      title: "Capítulo 2: Las Voces",
      content: `
        <h1>Capítulo 2: Las Voces</h1>
        
        <p>Las noches se habían vuelto territorio de voces que nadie más podía escuchar. Amaranta despertaba sobresaltada, creyendo haber oído su nombre susurrado entre las sombras de su habitación.</p>
        
        <p>Era siempre la misma voz: grave, melancólica, cargada de una tristeza que parecía habitar en los rincones más oscuros de la casa. Una voz que conocía desde la infancia, pero que ahora la llamaba con una urgencia nueva, desesperada.</p>
        
        <p>Se levantaba de la cama y recorría los pasillos descalza, siguiendo el eco que la guiaba hacia el desván. Allí, entre cajas de recuerdos y muebles cubiertos por sábanas, encontraba siempre el mismo diario abierto en páginas diferentes.</p>
        
        <p>Era el diario de su madre, quien había muerto cuando ella apenas tenía cinco años. Las páginas amarillentas contenían confesiones que jamás debió leer, secretos que explicaban por qué su padre la miraba a veces con una mezcla de amor y dolor.</p>
        
        <p style="font-style: italic; margin: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">"Hay amores que son condena, y yo he sido condenada a amar a quien no debía. Mi hija pagará por mis pecados, como yo pagué por los de mi madre, y su madre por los de la suya. Somos una estirpe de mujeres marcadas por la pasión ciega."</p>
        
        <p>Amaranta cerró el diario con manos temblorosas. Ahora entendía por qué las cartas, por qué las voces, por qué esa sensación constante de estar pagando una deuda que no había contraído.</p>
      `
    },
    {
      title: "Capítulo 3: El Perdón",
      content: `
        <h1>Capítulo 3: El Perdón</h1>
        
        <p>El viaje hacia el perdón no tiene mapa ni destino seguro. Amaranta lo aprendió esa madrugada de noviembre, cuando finalmente tuvo el valor de caminar hasta el cementerio y hablar con los fantasmas de su linaje.</p>
        
        <p>Bajo la luz pálida de la luna, encontró la tumba de la primera Amaranta. La lápida, erosionada por el tiempo, apenas dejaba leer: <em>"Amaranta Solís, 1892-1920. Amó como solo aman las almas perdidas."</em></p>
        
        <p>Se arrodilló sobre la tierra húmeda y, por primera vez en meses, habló en voz alta:</p>
        
        <p style="font-style: italic; margin: 20px; padding: 15px; border: 2px solid #e74c3c; border-radius: 8px; background: #fdf2f2;">"No sé qué hiciste, abuela. No sé qué hizo mi madre, ni mi bisabuela, ni todas las que vinieron antes. Pero yo estoy aquí, y estoy cansada de cargar con culpas que no son mías. Si el amor es nuestra maldición, que sea también nuestra redención."</p>
        
        <p>El viento dejó de soplar. Las voces callaron. Y por primera vez en su vida, Amaranta sintió el silencio no como una amenaza, sino como una promesa.</p>
        
        <p>Cuando regresó a casa, las cartas habían desaparecido del cajón. En su lugar, encontró una sola nota, escrita con su propia letra:</p>
        
        <blockquote style="font-style: italic; margin: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
          <p>"El pasado perdona a quien aprende a perdonarse a sí mismo. El futuro espera a quien tiene el valor de escribir su propia historia."</p>
        </blockquote>
        
        <p>Amaranta sonrió por primera vez en meses. La maldición había terminado, no porque alguien la hubiera roto, sino porque ella había decidido no heredarla.</p>
        
        <p>Algunas historias de amor terminan en tragedia. La suya, decidió, terminaría en libertad.</p>
        
        <p style="text-align: center; font-style: italic; color: #888; margin-top: 40px;">— Fin —</p>
      `
    }
  ];

  try {
    const options = {
      title: "Amaranta - Demo",
      author: "Ciriaco A. Pichardo (CiriWhispers)",
      publisher: "Editorial MaalCa",
      description: "Una joven enfrenta el eco de una culpa heredada. Versión demo para el lector digital de CiriWhispers.",
      language: "es",
      tocTitle: "Índice"
    };

    const epubBuffer = await EPub(options, content);
    await fs.writeFile(path.join(publicDir, "amaranta-demo.epub"), epubBuffer);
    console.log("✅ amaranta-demo.epub creado exitosamente");

    // Crear también un poemario simple
    const poemasContent = [
      {
        title: "Poemas de Luz",
        content: `
          <h1>Poemas de Luz</h1>
          
          <div style="margin: 30px 0;">
            <h2>1. Despertar</h2>
            <div style="margin-left: 20px; font-style: italic; line-height: 1.8;">
              <p>Abro los ojos<br/>
              y el mundo es nuevo otra vez.<br/>
              La luz se cuela por las cortinas<br/>
              como una promesa<br/>
              de que todo es posible.</p>
              
              <p>Hay café en la cocina,<br/>
              música en el aire,<br/>
              y en mi pecho<br/>
              el eco de un sueño<br/>
              que insiste en hacerse real.</p>
              
              <p>Hoy será un buen día<br/>
              porque decido que lo sea.</p>
            </div>
          </div>
          
          <div style="margin: 30px 0;">
            <h2>2. Cartas de Amor</h2>
            <div style="margin-left: 20px; font-style: italic; line-height: 1.8;">
              <p>Escribo tu nombre<br/>
              en el vapor del espejo.<br/>
              Se desvanece lentamente,<br/>
              como todo lo hermoso.</p>
              
              <p>Pero siempre vuelvo a escribirlo,<br/>
              una y otra vez,<br/>
              porque en la repetición<br/>
              encuentro la permanencia<br/>
              que el mundo me niega.</p>
            </div>
          </div>
        `
      },
      {
        title: "Poemas de Sombra",
        content: `
          <h1>Poemas de Sombra</h1>
          
          <div style="margin: 30px 0;">
            <h2>Insomnio</h2>
            <div style="margin-left: 20px; font-style: italic; line-height: 1.8; color: #555;">
              <p>Las 3 AM son territorio<br/>
              de pensamientos que no se atreven<br/>
              a salir durante el día.</p>
              
              <p>En la oscuridad del cuarto<br/>
              bailan los fantasmas<br/>
              de todo lo que pudo ser<br/>
              y no fue.</p>
              
              <p>Cada hora que pasa<br/>
              es un latido más<br/>
              del corazón insomne<br/>
              que se niega al descanso.</p>
            </div>
          </div>
          
          <div style="margin: 30px 0;">
            <h2>Vacío</h2>
            <div style="margin-left: 20px; font-style: italic; line-height: 1.8; color: #555;">
              <p>Hay un hueco<br/>
              con la forma exacta<br/>
              de tu ausencia.</p>
              
              <p>Lo llevo conmigo<br/>
              como una herida<br/>
              que no sangra<br/>
              pero duele.</p>
              
              <p>Y mientras no regreses,<br/>
              seguiré siendo<br/>
              una persona incompleta<br/>
              cargando su propio fantasma.</p>
            </div>
          </div>
        `
      }
    ];

    const poemasOptions = {
      title: "Luces & Sombras - Demo",
      author: "Ciriaco A. Pichardo (CiriWhispers)", 
      publisher: "Editorial MaalCa",
      description: "Poemas que rozan la piel y la contradicción. Versión demo para el lector digital.",
      language: "es",
      tocTitle: "Índice"
    };

    const poemasBuffer = await EPub(poemasOptions, poemasContent);
    await fs.writeFile(path.join(publicDir, "poemas-demo.epub"), poemasBuffer);
    console.log("✅ poemas-demo.epub creado exitosamente");

    console.log("\n🎉 EPUBs demo listos:");
    console.log("📖 /public/books/amaranta-demo.epub");
    console.log("🌟 /public/books/poemas-demo.epub");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  createSimpleEPUB().catch(console.error);
}

module.exports = { createSimpleEPUB };