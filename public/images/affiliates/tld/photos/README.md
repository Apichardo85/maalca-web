# TLD Photos

Guarda las fotos reales de la dueña aquí con esta nomenclatura exacta:

| Archivo esperado | Contenido |
|------------------|-----------|
| `parrillada-mixta-01.jpg` | Parrillada con pollo, chorizo, costilla + tostones/yuca/fries (tabla larga, vista top-down) |
| `parrillada-mixta-02.jpg` | Parrillada close-up 3/4 (pollo con limón y pimientos en primer plano) |
| `habichuelas-con-dulce-01.jpg` | Pilón de barro con 3 galleticas encima (close-up vertical) |
| `habichuelas-con-dulce-02.jpg` | Ídem en formato horizontal o composición wide |
| `pollo-plancha-01.jpg` | Pollo a la plancha con arroz blanco y yuca frita sobre plato blanco |
| `moros-con-maduro-01.jpg` | Moros de habichuelas negras con plátano maduro y papas criollas sobre hoja de plátano |

**Tamaño mínimo**: 2000px lado largo (sirve para web + imprenta)
**Formato**: JPG optimizado (<500KB cada una ideal)

## Cómo guardar desde WhatsApp/chat

1. Descarga la foto al disco (click derecho → Guardar imagen como...)
2. Renombra con el nombre exacto de la tabla arriba
3. Copia a esta carpeta: `public/images/affiliates/tld/photos/`
4. En local: `npm run dev` → refresh → las fotos ya salen
5. Para producción: `git add public/images/affiliates/tld/photos/ && git commit -m "add real TLD photos" && git push`

Una vez guardes los archivos, `next/image` los sirve automáticamente con lazy loading y conversión a WebP.
