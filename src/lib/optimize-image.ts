import sharp from 'sharp';

/**
 * Optimiza una imagen subida por el dueño antes de guardarla en Storage.
 *
 * Por qué: los celulares suben fotos de 3–5 MB (4000 px). Una TV/tablet barata las tarda en
 * descargar y en decodificar, y se nota "cargando" al rotar el menu board. Una foto de plato a
 * 1600 px en WebP pesa ~100–250 KB y se ve igual en una pantalla Full HD.
 *
 * Reglas (para mantenerlo liviano y sin sorpresas):
 *  - `sharp` ya es dependencia del proyecto (no agrega nada nuevo).
 *  - Solo JPEG/PNG/WebP. Cualquier otra cosa pasa sin tocar.
 *  - Falla "abierta": si algo sale mal, o el resultado no es más chico, se guarda el original.
 *    Optimizar nunca debe impedir una subida.
 *  - Respeta la orientación EXIF (fotos de celular) y la transparencia (logos PNG → WebP con alfa).
 */
export const OPTIMIZE_MAX_DIMENSION = 1600;
const OPTIMIZE_QUALITY = 80;
const OPTIMIZABLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

const EXT_BY_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function optimizeImage(
  input: Buffer,
  contentType: string,
  maxDimension: number = OPTIMIZE_MAX_DIMENSION,
): Promise<OptimizedImage> {
  const original: OptimizedImage = { buffer: input, contentType, ext: EXT_BY_TYPE[contentType] ?? 'bin' };
  if (!OPTIMIZABLE.has(contentType)) return original;
  try {
    const output = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: OPTIMIZE_QUALITY })
      .toBuffer();
    if (output.length >= input.length) return original;
    return { buffer: output, contentType: 'image/webp', ext: 'webp' };
  } catch {
    return original;
  }
}
