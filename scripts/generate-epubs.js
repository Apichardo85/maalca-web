const EPub = require("epub-gen-memory").default || require("epub-gen-memory");
const fs = require("fs").promises;
const path = require("path");

// Contenido de Amaranta (primer capítulo + contenido adicional)
const amarantaContent = [
  {
    title: "Capítulo I: El Eco de una Culpa",
    content: `
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
      
      <p>Amaranta guardó la carta en el cajón de su cómoda, junto a las otras cartas que había estado recibiendo en silencio durante meses. Todas sin firma, todas con el mismo mensaje: el pasado no perdona, y el presente debe pagar por los errores de quienes vinieron antes.</p>
    `
  },
  {
    title: "Capítulo II: Voces en el Silencio",
    content: `
      <h1>Capítulo II: Voces en el Silencio</h1>
      
      <p>Las noches se habían vuelto territorio de voces que nadie más podía escuchar. Amaranta despertaba sobresaltada, creyendo haber oído su nombre susurrado entre las sombras de su habitación.</p>
      
      <p>Era siempre la misma voz: grave, melancólica, cargada de una tristeza que parecía habitar en los rincones más oscuros de la casa. Una voz que conocía desde la infancia, pero que ahora la llamaba con una urgencia nueva, desesperada.</p>
      
      <p>Se levantaba de la cama y recorría los pasillos descalza, siguiendo el eco que la guiaba hacia el desván. Allí, entre cajas de recuerdos y muebles cubiertos por sábanas, encontraba siempre el mismo diario abierto en páginas diferentes.</p>
      
      <p>Era el diario de su madre, quien había muerto cuando ella apenas tenía cinco años. Las páginas amarillentas contenían confesiones que jamás debió leer, secretos que explicaban por qué su padre la miraba a veces con una mezcla de amor y dolor.</p>
      
      <p><em>"Hay amores que son condena,"</em> leyó una noche, <em>"y yo he sido condenada a amar a quien no debía. Mi hija pagará por mis pecados, como yo pagué por los de mi madre, y su madre por los de la suya. Somos una estirpe de mujeres marcadas por la pasión ciega."</em></p>
      
      <p>Amaranta cerró el diario con manos temblorosas. Ahora entendía por qué las cartas, por qué las voces, por qué esa sensación constante de estar pagando una deuda que no había contraído.</p>
      
      <p>Pero había algo más. En la última página que había leído, su madre mencionaba un lugar: el viejo cementerio a las afueras del pueblo, donde estaba enterrada la primera Amaranta de la familia, aquella de quien había heredado el nombre y, aparentemente, la maldición.</p>
    `
  },
  {
    title: "Epílogo: El Perdón de las Almas",
    content: `
      <h1>Epílogo: El Perdón de las Almas</h1>
      
      <p>El viaje hacia el perdón no tiene mapa ni destino seguro. Amaranta lo aprendió esa madrugada de noviembre, cuando finalmente tuvo el valor de caminar hasta el cementerio y hablar con los fantasmas de su linaje.</p>
      
      <p>Bajo la luz pálida de la luna, encontró la tumba de la primera Amaranta. La lápida, erosionada por el tiempo, apenas dejaba leer: <em>"Amaranta Solís, 1892-1920. Amó como solo aman las almas perdidas."</em></p>
      
      <p>Se arrodilló sobre la tierra húmeda y, por primera vez en meses, habló en voz alta:</p>
      
      <p><em>"No sé qué hiciste, abuela. No sé qué hizo mi madre, ni mi bisabuela, ni todas las que vinieron antes. Pero yo estoy aquí, y estoy cansada de cargar con culpas que no son mías. Si el amor es nuestra maldición, que sea también nuestra redención."</em></p>
      
      <p>El viento dejó de soplar. Las voces callaron. Y por primera vez en su vida, Amaranta sintió el silencio no como una amenaza, sino como una promesa.</p>
      
      <p>Cuando regresó a casa, las cartas habían desaparecido del cajón. En su lugar, encontró una sola nota, escrita con su propia letra:</p>
      
      <blockquote>
        <p><em>"El pasado perdona a quien aprende a perdonarse a sí mismo. El futuro espera a quien tiene el valor de escribir su propia historia."</em></p>
      </blockquote>
      
      <p>Amaranta sonrió por primera vez en meses. La maldición había terminado, no porque alguien la hubiera roto, sino porque ella había decidido no heredarla.</p>
      
      <p>Algunas historias de amor terminan en tragedia. La suya, decidió, terminaría en libertad.</p>
    `
  }
];

// Contenido de Luces & Sombras (selección de poemas)
const lucesSombrasContent = [
  {
    title: "Prólogo",
    content: `
      <h1>Prólogo</h1>
      <h2>106 Poemas entre la Luz y la Oscuridad</h2>
      
      <p><em>Hay luces que solo brillan en la oscuridad más absoluta, como las estrellas que nacen del vacío.</em></p>
      
      <p>Este poemario es un viaje por los contrastes del alma humana. Entre versos que susurran y gritos silenciosos, encontrarás 106 poemas que exploran el amor, la pérdida, la esperanza y el vacío que a veces habitamos.</p>
      
      <p>Cada poema es una fotografía del instante: esos momentos en que la luz y la sombra danzan juntas, creando matices que solo el corazón puede percibir.</p>
      
      <p><strong>— CiriWhispers</strong><br/>
      <em>Elmira, NY</em></p>
    `
  },
  {
    title: "I. Luces",
    content: `
      <h1>I. Luces</h1>
      
      <div style="margin: 2em 0;">
        <h3>1. Despertar</h3>
        <div style="margin-left: 1em; font-style: italic;">
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
      
      <div style="margin: 2em 0;">
        <h3>2. Cartas de Amor</h3>
        <div style="margin-left: 1em; font-style: italic;">
          <p>Escribo tu nombre<br/>
          en el vapor del espejo.<br/>
          Se desvanece lentamente,<br/>
          como todo lo hermoso.</p>
          
          <p>Pero siempre vuelvo a escribirlo,<br/>
          una y otra vez,<br/>
          porque en la repetición<br/>
          encuentro la permanencia<br/>
          que el mundo me niega.</p>
          
          <p>Tu nombre es mi oración matutina,<br/>
          mi mantra nocturno,<br/>
          la palabra que pronuncio<br/>
          cuando necesito recordar<br/>
          que el amor existe.</p>
        </div>
      </div>
      
      <div style="margin: 2em 0;">
        <h3>3. Primavera Interior</h3>
        <div style="margin-left: 1em; font-style: italic;">
          <p>Había olvidado<br/>
          cómo se siente la esperanza<br/>
          germinando en el pecho.</p>
          
          <p>Llega sin avisar,<br/>
          tímida como una flor<br/>
          que asoma entre las grietas<br/>
          del pavimento.</p>
          
          <p>Y de pronto<br/>
          todo lo que creía muerto<br/>
          vuelve a latir.</p>
        </div>
      </div>
    `
  },
  {
    title: "II. Sombras",
    content: `
      <h1>II. Sombras</h1>
      
      <div style="margin: 2em 0;">
        <h3>54. Insomnio</h3>
        <div style="margin-left: 1em; font-style: italic;">
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
          
          <p>Porque dormir<br/>
          es rendirse,<br/>
          y yo aún no estoy listo<br/>
          para la paz.</p>
        </div>
      </div>
      
      <div style="margin: 2em 0;">
        <h3>67. Vacío</h3>
        <div style="margin-left: 1em; font-style: italic;">
          <p>Hay un hueco<br/>
          con la forma exacta<br/>
          de tu ausencia.</p>
          
          <p>Lo llevo conmigo<br/>
          como una herida<br/>
          que no sangra<br/>
          pero duele.</p>
          
          <p>A veces trato de llenarlo<br/>
          con otras voces,<br/>
          otros brazos,<br/>
          otros nombres.</p>
          
          <p>Pero el vacío<br/>
          reconoce solo<br/>
          una forma,<br/>
          una medida,<br/>
          un corazón específico.</p>
          
          <p>Y mientras no regreses,<br/>
          seguiré siendo<br/>
          una persona incompleta<br/>
          cargando su propio fantasma.</p>
        </div>
      </div>
      
      <div style="margin: 2em 0;">
        <h3>89. Despedida</h3>
        <div style="margin-left: 1em; font-style: italic;">
          <p>Las despedidas<br/>
          nunca son del todo.<br/>
          Siempre queda algo:</p>
          
          <p>tu perfume en mi almohada,<br/>
          tu risa en mi memoria,<br/>
          tu nombre tatuado<br/>
          en el reverso de mis párpados.</p>
          
          <p>Te fuiste<br/>
          pero dejaste pistas<br/>
          de tu existencia<br/>
          regadas por toda mi vida.</p>
          
          <p>Y aunque diga que te olvido,<br/>
          sé que miento.<br/>
          Porque hay amores<br/>
          que se quedan<br/>
          aunque las personas se vayan.</p>
        </div>
      </div>
    `
  },
  {
    title: "III. Encuentro",
    content: `
      <h1>III. Encuentro</h1>
      
      <div style="margin: 2em 0;">
        <h3>106. Luz en la Sombra</h3>
        <div style="margin-left: 1em; font-style: italic;">
          <p>Al final del laberinto<br/>
          no hay minotauro.<br/>
          Hay un espejo.</p>
          
          <p>Y en el espejo,<br/>
          mi rostro<br/>
          dividido por la mitad:</p>
          
          <p>luz y sombra,<br/>
          esperanza y melancolía,<br/>
          amor y pérdida<br/>
          habitando el mismo corazón.</p>
          
          <p>Comprendo entonces<br/>
          que no hay que elegir<br/>
          entre la luz y la oscuridad.</p>
          
          <p>Hay que aprender<br/>
          a ser ambas,<br/>
          a vivir en el contraste,<br/>
          a encontrar la belleza<br/>
          en la contradicción.</p>
          
          <p>Porque somos<br/>
          criaturas de matices,<br/>
          y en la mezcla<br/>
          está nuestra verdad.</p>
          
          <p><em>— Fin —</em></p>
        </div>
      </div>
    `
  }
];

// Función para generar EPUBs
async function generateEPUBs() {
  const publicDir = path.join(__dirname, "..", "public", "books");
  
  // Crear directorio si no existe
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  console.log("📚 Generando EPUBs...");

  // Generar Amaranta
  try {
    const amarantaOptions = {
      title: "Amaranta",
      author: "Ciriaco A. Pichardo (CiriWhispers)",
      publisher: "Editorial MaalCa",
      description: "Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar también puede ser una forma de perdón.",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop", // Placeholder cover
      lang: "es",
      tocTitle: "Índice",
      version: 3,
      verbose: true
    };

    const amarantaBuffer = await EPub(amarantaOptions, amarantaContent);
    await fs.writeFile(path.join(publicDir, "amaranta.epub"), amarantaBuffer);
    console.log("✅ Amaranta.epub generado exitosamente");
  } catch (error) {
    console.error("❌ Error generando Amaranta:", error);
  }

  // Generar Luces & Sombras
  try {
    const lucesSombrasOptions = {
      title: "Luces & Sombras",
      author: "Ciriaco A. Pichardo (CiriWhispers)",
      publisher: "Editorial MaalCa",
      description: "106 poemas que rozan la piel y la contradicción: amor, pérdida y el resplandor que solo se ve cuando todo oscurece.",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", // Placeholder cover
      lang: "es",
      tocTitle: "Índice",
      version: 3,
      verbose: true
    };

    const lucesSombrasBuffer = await EPub(lucesSombrasOptions, lucesSombrasContent);
    await fs.writeFile(path.join(publicDir, "luces-sombras.epub"), lucesSombrasBuffer);
    console.log("✅ Luces-Sombras.epub generado exitosamente");
  } catch (error) {
    console.error("❌ Error generando Luces & Sombras:", error);
  }

  console.log("\n🎉 EPUBs generados en /public/books/");
  console.log("📖 Amaranta: /public/books/amaranta.epub");
  console.log("🌟 Luces & Sombras: /public/books/luces-sombras.epub");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateEPUBs().catch(console.error);
}

module.exports = { generateEPUBs };