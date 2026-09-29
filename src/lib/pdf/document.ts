/**
 * Generador de PDF compartido — reemplaza las tres implementaciones jsPDF independientes que
 * existían en InvoicesContent.tsx, ProposalsContent.tsx y PublicProposalContent.tsx (cada una
 * dibujando el mismo layout a mano, en Helvetica negro/gris, sin logo ni color de marca).
 *
 * Migración a este módulo: tarea #2 del backlog (ver docs/audits/business-type-flows-audit.md,
 * actualización 2026-09-29). Este archivo solo define el generador; no toca los tres call sites
 * todavía.
 *
 * Uso: los tres documentos (factura, propuesta dashboard, propuesta pública) tienen la misma
 * forma estructural -- encabezado con marca, identificación del cliente, cuerpo (tabla de items
 * o descripción libre), total, badge de estado opcional -- así que un solo `downloadBrandedPdf`
 * cubre los tres con datos distintos en vez de tres copias del dibujo.
 */

export interface BrandInfo {
  /** Nombre del negocio, mostrado si no hay logo o como texto alternativo. */
  name: string;
  /** URL del logo (Affiliate.LogoUrl). Si no carga o no existe, se cae a solo texto sin romper el PDF. */
  logoUrl?: string | null;
  /** Hex del negocio (Affiliate.PrimaryColor), p.ej. "#045AFE". Si falta, usa el azul de marca MaalCa por defecto. */
  primaryColor?: string | null;
}

export interface DocumentLineItem {
  description: string;
  quantity?: number;
  /** Ya formateado en la moneda correcta (Intl.NumberFormat) -- este módulo no formatea montos. */
  total: string;
}

export interface DocumentTotalLine {
  label: string;
  value: string;
}

export interface StatusBadge {
  label: string;
  tone: 'success' | 'danger' | 'neutral';
  /** Texto secundario bajo el badge -- motivo de anulación, quién firmó, etc. */
  note?: string;
}

export interface BrandedDocumentConfig {
  brand: BrandInfo;
  /** Número de factura o título de la propuesta. */
  documentTitle: string;
  counterpartLabel: string;
  counterpartName: string;
  /** Líneas de metadata bajo el título -- "Emitida: ...", "Vence: ...". */
  metaLines?: string[];
  /** Descripción libre (propuestas) -- se envuelve automáticamente al ancho de la página. */
  description?: string;
  /** Tabla de items (facturas) -- se omite si no hay items, cayendo directo al total. */
  items?: DocumentLineItem[];
  /** Subtotal/impuesto -- se muestran antes del total en fuente más chica. */
  subtotalLines?: DocumentTotalLine[];
  amountValue: string;
  status?: StatusBadge;
  attachmentUrl?: string;
  /** Nombre del archivo sin extensión -- se le agrega ".pdf". */
  filename: string;
}

const DEFAULT_BRAND_COLOR = '#045AFE'; // azul MaalCa (ver globals.css) -- fallback si el negocio no configuró primaryColor
const STATUS_COLORS: Record<StatusBadge['tone'], string> = {
  success: '#168246',
  danger: '#B42828',
  neutral: '#5A5A5A',
};

/**
 * Descarga la imagen del logo y la convierte a data URL para que jsPDF pueda embeberla
 * (doc.addImage necesita los bytes, no puede apuntar a una URL externa). Falla en silencio --
 * un logo que no cargó nunca debe tumbar la descarga del documento, se cae a solo texto.
 */
async function loadLogoAsDataUrl(logoUrl: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const dims: { width: number; height: number } = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });

    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

/**
 * Genera y descarga un PDF con la marca del negocio (logo + color). Reemplaza el dibujo manual
 * duplicado en los tres lugares -- ver comentario de módulo arriba.
 */
export async function downloadBrandedPdf(config: BrandedDocumentConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;
  const brandColor = config.brand.primaryColor || DEFAULT_BRAND_COLOR;
  let y = 64;

  // --- Encabezado: logo (si carga) + nombre del negocio ---
  const logo = config.brand.logoUrl ? await loadLogoAsDataUrl(config.brand.logoUrl) : null;
  if (logo) {
    const maxLogoHeight = 36;
    const scale = maxLogoHeight / logo.height;
    const logoWidth = logo.width * scale;
    // jsPDF necesita el formato de imagen explícito; inferirlo del prefijo del data URL cubre
    // los casos reales (los logos se suben como PNG/JPEG en el uploader de Configuración).
    const format = logo.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    try {
      doc.addImage(logo.dataUrl, format, marginX, y - 24, logoWidth, maxLogoHeight);
    } catch {
      // Formato de imagen que jsPDF no soporta (p.ej. WEBP/SVG) -- se cae a solo texto abajo.
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(config.brand.name, marginX + logoWidth + 12, y);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(brandColor);
    doc.text(config.brand.name, marginX, y);
  }
  y += 34;

  // Línea delgada de color de marca separando el encabezado del cuerpo -- el único lugar
  // "decorativo" del documento, a propósito minimalista para que imprima bien.
  doc.setDrawColor(brandColor);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 28;

  // --- Título del documento (número de factura / título de propuesta) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text(config.documentTitle, marginX, y);
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(`${config.counterpartLabel}: ${config.counterpartName}`, marginX, y);
  y += 18;

  for (const line of config.metaLines ?? []) {
    doc.text(line, marginX, y);
    y += 18;
  }
  y += 4;

  // --- Descripción libre (propuestas) ---
  if (config.description) {
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(config.description, contentWidth);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 15 + 14;
  }

  // --- Tabla de items (facturas) ---
  if (config.items && config.items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Descripción', marginX, y);
    doc.text('Cant.', marginX + contentWidth - 160, y);
    doc.text('Total', marginX + contentWidth - 70, y);
    y += 6;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    for (const item of config.items) {
      doc.text(item.description, marginX, y, { maxWidth: contentWidth - 170 });
      if (item.quantity != null) doc.text(String(item.quantity), marginX + contentWidth - 160, y);
      doc.text(item.total, marginX + contentWidth - 70, y);
      y += 16;
    }
    y += 10;
  }

  // --- Subtotal / impuesto (opcional) ---
  if (config.subtotalLines) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    for (const line of config.subtotalLines) {
      doc.text(`${line.label}: ${line.value}`, marginX, y);
      y += 14;
    }
    y += 6;
  }

  // --- Total / monto, en el color de marca ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(brandColor);
  doc.text(config.amountValue, marginX, y);
  y += 28;

  // --- Badge de estado (Pagada/Aceptada/Anulada + nota) ---
  if (config.status) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(STATUS_COLORS[config.status.tone]);
    doc.text(config.status.label, marginX, y);
    y += 18;
    if (config.status.note) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(config.status.note, marginX, y, { maxWidth: contentWidth });
      y += 18;
    }
  }

  // --- Adjunto ---
  if (config.attachmentUrl) {
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text('Documento adjunto:', marginX, y);
    y += 13;
    doc.setTextColor(brandColor);
    doc.textWithLink(config.attachmentUrl, marginX, y, { url: config.attachmentUrl });
  }

  // --- Footer de marca MaalCa, fijo al fondo de la página ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('Generado con MaalCa · maalca.com', marginX, pageHeight - 32);

  doc.save(`${config.filename}.pdf`);
}
