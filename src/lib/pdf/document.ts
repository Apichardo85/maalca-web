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
  /** Omitir si el documento no tiene una contraparte separada que mostrar (p.ej. la vista publica de una propuesta). */
  counterpartLabel?: string;
  counterpartName?: string;
  /** Líneas de metadata bajo el título -- "Emitida: ...", "Vence: ...". */
  metaLines?: string[];
  /** Descripción libre (propuestas) -- se envuelve automáticamente al ancho de la página. */
  description?: string;
  /** Tabla de items (facturas) -- se omite si no hay items, cayendo directo al total. */
  items?: DocumentLineItem[];
  /** Subtotal/impuesto -- se muestran antes del total en fuente más chica. */
  subtotalLines?: DocumentTotalLine[];
  /** Tablas adicionales con título (reportes): se dibujan después de `items`, antes de los totales. */
  sections?: { title: string; items: DocumentLineItem[]; emptyText?: string }[];
  /** Rótulo del monto grande (por defecto "Total"): "Saldo" en un estado de cuenta, "Utilidad" en un reporte. */
  amountLabel?: string;
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

    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });

    // Se re-dibuja sobre fondo blanco: un PNG con transparencia sale como caja negra en jsPDF, y así
    // también se admiten formatos que jsPDF no lee directo (WEBP).
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.92), width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_BRAND_COLOR;
  return [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)) as [number, number, number];
}

const mix = (c: [number, number, number], target: number, amount: number): [number, number, number] =>
  c.map((v) => Math.round(v + (target - v) * amount)) as [number, number, number];

/**
 * Genera y descarga un PDF con la marca del negocio (logo + color): banda de color arriba, encabezado con logo,
 * bloque de cliente, tabla con filas alternas (con salto de página), caja de totales, estado como etiqueta y
 * pie con número de página. Lo usan facturas, propuestas, estados de cuenta y reportes.
 */
export async function downloadBrandedPdf(config: BrandedDocumentConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const right = pageWidth - marginX;
  const contentWidth = right - marginX;
  const bottomLimit = pageHeight - 70;

  // Color de marca; si es muy claro (texto blanco ilegible encima) se oscurece.
  const base = hexToRgb(config.brand.primaryColor || DEFAULT_BRAND_COLOR);
  const lum = (0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2]) / 255;
  const accent = lum > 0.6 ? mix(base, 0, 0.4) : base;
  const tint = mix(accent, 255, 0.92);
  const [ar, ag, ab] = accent;

  doc.setFillColor(ar, ag, ab);
  doc.rect(0, 0, pageWidth, 10, 'F');
  let y = 44;

  // --- Encabezado: logo + nombre a la izquierda; título y datos a la derecha ---
  const logo = config.brand.logoUrl ? await loadLogoAsDataUrl(config.brand.logoUrl) : null;
  let textX = marginX;
  if (logo) {
    const maxH = 48;
    const maxW = 120;
    const scale = Math.min(maxH / logo.height, maxW / logo.width);
    const w = logo.width * scale;
    const h = logo.height * scale;
    try {
      doc.addImage(logo.dataUrl, 'JPEG', marginX, y, w, h);
      textX = marginX + w + 12;
    } catch {
      // Formato que jsPDF no lee: se cae a solo texto.
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  const nameLines = doc.splitTextToSize(config.brand.name, right - textX - 200) as string[];
  doc.text(nameLines, textX, y + 20);

  doc.setFontSize(20);
  doc.setTextColor(ar, ag, ab);
  doc.text(config.documentTitle, right, y + 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let metaY = y + 36;
  for (const line of config.metaLines ?? []) {
    doc.text(line, right, metaY, { align: 'right' });
    metaY += 14;
  }
  y = Math.max(y + 56, metaY) + 14;

  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, right, y);
  y += 22;

  // --- Bloque de cliente ---
  if (config.counterpartLabel && config.counterpartName) {
    const nameWrapped = doc.splitTextToSize(config.counterpartName, contentWidth - 32) as string[];
    const boxH = 34 + nameWrapped.length * 16;
    doc.setFillColor(tint[0], tint[1], tint[2]);
    doc.roundedRect(marginX, y, contentWidth, boxH, 6, 6, 'F');
    doc.setFillColor(ar, ag, ab);
    doc.rect(marginX, y, 4, boxH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(ar, ag, ab);
    doc.text(config.counterpartLabel.toUpperCase(), marginX + 16, y + 17);
    doc.setFontSize(13);
    doc.setTextColor(25, 25, 25);
    doc.text(nameWrapped, marginX + 16, y + 34);
    y += boxH + 22;
  }

  // --- Descripción libre (propuestas) ---
  if (config.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(config.description, contentWidth) as string[];
    for (const line of wrapped) {
      if (y > bottomLimit) {
        doc.addPage();
        y = 56;
      }
      doc.text(line, marginX, y);
      y += 15;
    }
    y += 14;
  }

  // --- Tablas (items + secciones extra) con filas alternas y salto de página ---
  const drawTable = (rows: DocumentLineItem[], heading?: string, emptyText?: string) => {
    if (rows.length === 0 && !emptyText) return;
    if (heading) {
      if (y + 60 > bottomLimit) {
        doc.addPage();
        y = 56;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(heading, marginX, y + 4);
      y += 16;
    }
    if (rows.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(130, 130, 130);
      doc.text(emptyText as string, marginX + 10, y + 8);
      y += 34;
      return;
    }
    const hasQty = rows.some((i) => i.quantity != null);
    const totalX = right - 10;
    const qtyX = right - 130;
    const drawHead = () => {
      doc.setFillColor(ar, ag, ab);
      doc.roundedRect(marginX, y, contentWidth, 24, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('DESCRIPCIÓN', marginX + 10, y + 15.5);
      if (hasQty) doc.text('CANT.', qtyX, y + 15.5, { align: 'right' });
      doc.text('TOTAL', totalX, y + 15.5, { align: 'right' });
      y += 24;
    };
    drawHead();
    rows.forEach((item, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descW = contentWidth - 20 - (hasQty ? 150 : 110);
      const lines = doc.splitTextToSize(item.description, descW) as string[];
      const rowH = Math.max(26, lines.length * 13 + 12);
      if (y + rowH > bottomLimit) {
        doc.addPage();
        y = 56;
        drawHead();
      }
      if (idx % 2 === 0) {
        doc.setFillColor(246, 247, 249);
        doc.rect(marginX, y, contentWidth, rowH, 'F');
      }
      // drawHead() deja la fuente en negrita: se restablece después de un salto de página.
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(lines, marginX + 10, y + 17);
      if (hasQty && item.quantity != null) doc.text(String(item.quantity), qtyX, y + 17, { align: 'right' });
      doc.text(item.total, totalX, y + 17, { align: 'right' });
      y += rowH;
    });
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.8);
    doc.line(marginX, y, right, y);
    y += 22;
  };
  drawTable(config.items ?? []);
  for (const section of config.sections ?? []) drawTable(section.items, section.title, section.emptyText);

  // --- Caja de totales a la derecha ---
  const boxW = 290;
  const boxX = right - boxW;
  const sub = config.subtotalLines ?? [];
  const totalBoxH = 46;
  const needed = sub.length * 18 + totalBoxH + (config.status ? 50 : 0) + 20;
  if (y + needed > bottomLimit) {
    doc.addPage();
    y = 56;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const line of sub) {
    doc.setTextColor(100, 100, 100);
    doc.text(line.label, boxX + 10, y);
    doc.setTextColor(40, 40, 40);
    doc.text(line.value, right - 10, y, { align: 'right' });
    y += 18;
  }
  if (sub.length > 0) y += 4;
  doc.setFillColor(ar, ag, ab);
  doc.roundedRect(boxX, y, boxW, totalBoxH, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text((config.amountLabel ?? 'Total').toUpperCase(), boxX + 14, y + 27);
  doc.setFontSize(18);
  doc.text(config.amountValue, right - 14, y + 29, { align: 'right' });
  y += totalBoxH + 18;

  // --- Estado como etiqueta (Pagada/Aceptada/Anulada/Saldo pendiente) + nota ---
  if (config.status) {
    const col = hexToRgb(STATUS_COLORS[config.status.tone]);
    const bg = mix(col, 255, 0.88);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const w = doc.getTextWidth(config.status.label) + 26;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.roundedRect(right - w, y, w, 22, 11, 11, 'F');
    doc.setTextColor(col[0], col[1], col[2]);
    doc.text(config.status.label, right - w / 2, y + 14.5, { align: 'center' });
    y += 34;
    if (config.status.note) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      const note = doc.splitTextToSize(config.status.note, boxW + 40) as string[];
      doc.text(note, right, y, { align: 'right' });
      y += note.length * 13 + 8;
    }
  }

  // --- Adjunto ---
  if (config.attachmentUrl) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text('Documento adjunto:', marginX, y);
    y += 13;
    doc.setTextColor(ar, ag, ab);
    doc.textWithLink(config.attachmentUrl, marginX, y, { url: config.attachmentUrl });
  }

  // --- Pie en todas las páginas: negocio, fecha y número de página ---
  const pages = doc.getNumberOfPages();
  const today = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' });
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.8);
    doc.line(marginX, pageHeight - 46, right, pageHeight - 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(130, 130, 130);
    doc.text(`${config.brand.name} · ${today}`, marginX, pageHeight - 30);
    doc.text(`Página ${i} de ${pages}`, right, pageHeight - 30, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text('Generado con MaalCa · maalca.com', pageWidth / 2, pageHeight - 18, { align: 'center' });
  }

  doc.save(`${config.filename}.pdf`);
}
