// Levantamientos de prospectos — tipos, plantillas y textos compartidos entre /ops/levantamientos
// (donde MaalCa arma y comparte el enlace) y /levantamiento/[token] (donde responde el prospecto).
// Las plantillas son solo el punto de partida: cada levantamiento guarda su propia copia de las
// preguntas en maalca-api y se edita desde /ops antes de enviarlo.

export type IntakeQuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'yesno'
  | 'file';

export interface IntakeQuestion {
  key: string;
  label: string;
  type: IntakeQuestionType;
  section?: string;
  help?: string;
  required?: boolean;
  options?: string[];
}

export interface IntakeFile {
  path: string;
  name: string;
}

export type IntakeAnswer = string | string[] | IntakeFile[] | null;
export type IntakeAnswers = Record<string, IntakeAnswer>;

export type IntakeStatus = 'open' | 'submitted' | 'reviewed' | 'closed';
export type IntakeLanguage = 'es' | 'en';

export interface PublicIntake {
  businessName: string;
  contactName: string | null;
  title: string;
  introMessage: string | null;
  advisorName: string | null;
  advisorContact: string | null;
  language: IntakeLanguage;
  questions: IntakeQuestion[];
  answers: IntakeAnswers | null;
  status: IntakeStatus;
  lastSavedAt: string | null;
  submittedAt: string | null;
}

export interface OpsIntakeSummary {
  id: string;
  token: string;
  businessName: string;
  contactName: string | null;
  status: IntakeStatus;
  questionCount: number;
  answeredCount: number;
  createdAt: string;
  lastSavedAt: string | null;
  submittedAt: string | null;
  createdByEmail: string;
}

export interface OpsIntake extends OpsIntakeSummary {
  contactEmail: string | null;
  contactPhone: string | null;
  title: string;
  introMessage: string | null;
  advisorName: string | null;
  advisorContact: string | null;
  language: IntakeLanguage;
  questions: IntakeQuestion[];
  answers: IntakeAnswers | null;
  reviewedAt: string | null;
  notes: string | null;
}

export const QUESTION_TYPE_LABELS: Record<IntakeQuestionType, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  number: 'Número',
  email: 'Correo',
  phone: 'Teléfono',
  select: 'Una opción',
  multiselect: 'Varias opciones',
  yesno: 'Sí / No',
  file: 'Archivo',
};

export const STATUS_LABELS: Record<IntakeStatus, string> = {
  open: 'Esperando respuesta',
  submitted: 'Respondido',
  reviewed: 'Revisado',
  closed: 'Cerrado',
};

/** Archivos que acepta el formulario público. 4 MB: tope de cuerpo de las funciones de Vercel. */
export const INTAKE_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const INTAKE_FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.csv,.xls,.xlsx,.docx';
export const INTAKE_MAX_FILE_SIZE = 4 * 1024 * 1024;
export const INTAKE_MAX_FILES = 5;
/** Bucket privado: las respuestas pueden traer listas de clientes o documentos fiscales. */
export const INTAKE_BUCKET = 'intake-private';

/** Clave de pregunta a partir de su texto (minúsculas, números y _), única dentro de la lista. */
export function questionKeyFrom(label: string, taken: string[]): string {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 34) || 'pregunta';
  let key = base;
  let n = 2;
  while (taken.includes(key)) key = `${base}_${n++}`;
  return key;
}

export function hasAnswer(v: IntakeAnswer | undefined): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return v.trim().length > 0;
}

/** Mensaje listo para WhatsApp / correo con el enlace del levantamiento. */
export function intakeShareMessage(params: {
  link: string;
  businessName: string;
  contactName?: string | null;
  advisorName?: string | null;
  language: IntakeLanguage;
}): string {
  const { link, businessName, contactName, advisorName, language } = params;
  if (language === 'en') {
    return [
      `Hi${contactName ? ` ${contactName}` : ''}! ${advisorName ? `This is ${advisorName} from MaalCa.` : 'This is the MaalCa team.'}`,
      `To set up ${businessName}'s space we need a few details. It takes about 10 minutes, works on your phone and saves as you go:`,
      link,
    ].join('\n\n');
  }
  return [
    `¡Hola${contactName ? ` ${contactName}` : ''}! ${advisorName ? `Te escribe ${advisorName}, de MaalCa.` : 'Te escribe el equipo de MaalCa.'}`,
    `Para dejar listo el espacio de ${businessName} necesitamos algunos datos. Toma unos 10 minutos, funciona desde el celular y se guarda solo mientras avanzas:`,
    link,
  ].join('\n\n');
}

// ---------------------------------------------------------------- plantillas

export interface IntakeTemplate {
  id: string;
  name: string;
  description: string;
  intro: string;
  questions: IntakeQuestion[];
}

const BRAND_QUESTIONS: IntakeQuestion[] = [
  { key: 'logo', label: 'Logo del negocio', type: 'file', section: 'Tu marca', help: 'PNG o JPG, idealmente con fondo transparente. Si no tienes logo, déjalo vacío: lo resolvemos juntos.' },
  { key: 'colores_marca', label: 'Colores de tu marca', type: 'text', section: 'Tu marca', help: 'Ej.: azul y blanco. Si tienes los códigos (#045AFE), mejor.' },
  { key: 'redes_sociales', label: 'Redes sociales y página web actuales', type: 'textarea', section: 'Tu marca', help: 'Instagram, Facebook, WhatsApp Business, sitio web… un enlace por línea.' },
];

export const INTAKE_TEMPLATES: IntakeTemplate[] = [
  {
    id: 'fabrica-distribucion',
    name: 'Fábrica / distribución',
    description: 'Agua, hielo, bebidas o productos con clientes por contrato, mostrador y rutas.',
    intro:
      'Gracias por elegir MaalCa. Con estas respuestas configuramos tu sistema de punta a punta: clientes por contrato, punto de venta, facturas pendientes, gastos fijos e inventario. Puedes responder por partes; todo se guarda automáticamente.',
    questions: [
      { key: 'razon_social', label: 'Razón social', type: 'text', section: 'Tu empresa', required: true },
      { key: 'rnc', label: 'RNC', type: 'text', section: 'Tu empresa', required: true, help: 'Lo usamos para tus facturas con NCF.' },
      { key: 'direccion', label: 'Dirección de la planta', type: 'textarea', section: 'Tu empresa', required: true },
      { key: 'telefono', label: 'Teléfono principal', type: 'phone', section: 'Tu empresa', required: true },
      { key: 'correo', label: 'Correo de la empresa', type: 'email', section: 'Tu empresa' },
      { key: 'responsable', label: 'Persona responsable y su cargo', type: 'text', section: 'Tu empresa', required: true },
      ...BRAND_QUESTIONS,
      { key: 'productos', label: 'Productos y precios', type: 'textarea', section: 'Productos', required: true, help: 'Uno por línea: producto, presentación y precio. Ej.: Botellón 5 gal — RD$60.' },
      { key: 'lista_productos', label: '¿Tienes la lista en Excel o foto?', type: 'file', section: 'Productos', help: 'Opcional: súbela y la cargamos por ti.' },
      { key: 'clientes_contrato', label: '¿Cuántos clientes tienes por contrato?', type: 'number', section: 'Clientes y contratos', required: true },
      { key: 'frecuencia_entrega', label: '¿Cada cuánto les entregas?', type: 'multiselect', section: 'Clientes y contratos', options: ['Diario', 'Varias veces por semana', 'Semanal', 'Quincenal', 'Mensual', 'Por pedido'] },
      { key: 'frecuencia_cobro', label: '¿Cada cuánto les cobras?', type: 'multiselect', section: 'Clientes y contratos', options: ['Al entregar', 'Semanal', 'Quincenal', 'Mensual'] },
      { key: 'credito', label: '¿Vendes a crédito?', type: 'yesno', section: 'Clientes y contratos', required: true },
      { key: 'dias_credito', label: 'Si vendes a crédito, ¿cuántos días das para pagar?', type: 'text', section: 'Clientes y contratos' },
      { key: 'envases_retornables', label: '¿Prestas botellones u otros envases retornables?', type: 'yesno', section: 'Clientes y contratos', required: true, help: 'Si es así, llevamos el control de envases por cliente: préstamo, devolución y depósito.' },
      { key: 'deposito_envase', label: '¿Cobras depósito por envase?', type: 'yesno', section: 'Clientes y contratos' },
      { key: 'rutas', label: '¿Repartes por rutas o con camión?', type: 'yesno', section: 'Clientes y contratos', required: true },
      { key: 'cantidad_rutas', label: '¿Cuántas rutas o vehículos?', type: 'number', section: 'Clientes y contratos' },
      { key: 'lista_clientes', label: 'Lista actual de clientes', type: 'file', section: 'Clientes y contratos', help: 'Excel, PDF o fotos del cuaderno. La importamos por ti; queda en almacenamiento privado.' },
      { key: 'ncf', label: '¿Facturas con NCF?', type: 'yesno', section: 'Facturación y pagos', required: true },
      { key: 'ecf', label: '¿Estás obligado a factura electrónica (e-CF)?', type: 'select', section: 'Facturación y pagos', options: ['Sí', 'No', 'No sé'], required: true },
      { key: 'metodos_pago', label: '¿Cómo te pagan?', type: 'multiselect', section: 'Facturación y pagos', options: ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Crédito'], required: true },
      { key: 'moneda', label: 'Moneda para tu plan con MaalCa', type: 'select', section: 'Facturación y pagos', options: ['RD$', 'US$'], required: true },
      { key: 'gastos_fijos', label: 'Gastos fijos que quieres controlar', type: 'multiselect', section: 'Operación', options: ['Luz', 'Agua', 'Alquiler', 'Nómina', 'Combustible', 'Mantenimiento de equipos', 'Internet / teléfono', 'Préstamos'] },
      { key: 'usuarios', label: '¿Quiénes usarán el sistema?', type: 'multiselect', section: 'Operación', options: ['Dueño', 'Cajero', 'Despachador', 'Chofer', 'Contabilidad'], required: true },
      { key: 'cantidad_usuarios', label: '¿Cuántas personas en total?', type: 'number', section: 'Operación' },
      { key: 'internet', label: '¿Cómo es el internet en la planta?', type: 'select', section: 'Operación', options: ['Estable', 'Se cae a veces', 'Se cae seguido', 'No tenemos'], required: true },
      { key: 'datos_hoy', label: '¿Dónde llevas hoy tus datos?', type: 'multiselect', section: 'Operación', options: ['Excel', 'Cuaderno', 'Otro sistema', 'WhatsApp', 'No los llevo'], required: true },
      { key: 'comentarios', label: '¿Algo más que debamos saber?', type: 'textarea', section: 'Para terminar' },
    ],
  },
  {
    id: 'basico',
    name: 'Básico (cualquier negocio)',
    description: 'Datos de empresa, marca, productos o servicios y horario.',
    intro:
      'Gracias por elegir MaalCa. Con estas respuestas dejamos listo tu espacio con tu marca. Puedes responder por partes; todo se guarda automáticamente.',
    questions: [
      { key: 'razon_social', label: 'Nombre legal del negocio', type: 'text', section: 'Tu empresa', required: true },
      { key: 'documento_fiscal', label: 'RNC / Tax ID', type: 'text', section: 'Tu empresa' },
      { key: 'direccion', label: 'Dirección', type: 'textarea', section: 'Tu empresa', required: true },
      { key: 'telefono', label: 'Teléfono', type: 'phone', section: 'Tu empresa', required: true },
      { key: 'correo', label: 'Correo', type: 'email', section: 'Tu empresa', required: true },
      ...BRAND_QUESTIONS,
      { key: 'horario', label: 'Horario de atención', type: 'textarea', section: 'Tu operación', help: 'Ej.: Lun–Vie 8:00–18:00, Sáb 9:00–13:00.' },
      { key: 'oferta', label: 'Productos o servicios principales y precios', type: 'textarea', section: 'Tu operación', required: true },
      { key: 'archivo_oferta', label: 'Menú, catálogo o lista de precios', type: 'file', section: 'Tu operación' },
      { key: 'comentarios', label: '¿Algo más que debamos saber?', type: 'textarea', section: 'Para terminar' },
    ],
  },
  {
    id: 'ntc-going-digital',
    name: 'NTC — Going Digital (English)',
    description: 'Neighborhood Transformation Center (Elmira, NY): meals, classes, volunteers, forms and reporting. Crear el levantamiento con idioma English.',
    intro:
      'Thank you for taking the time to walk us through how the Center works today. Your answers help us set up a simple digital system that fits your programs, your volunteers and the reports you send to funders. You can answer in parts; everything saves automatically.',
    questions: [
      { key: 'org_name', label: 'Organization name', type: 'text', section: 'About the Center', required: true },
      { key: 'address', label: 'Address and shared spaces', type: 'textarea', section: 'About the Center', required: true, help: 'Include any space you share with other organizations (for example Meals on Wheels at 409 William St).' },
      { key: 'phone', label: 'Main phone', type: 'phone', section: 'About the Center', required: true },
      { key: 'email', label: 'Main email', type: 'email', section: 'About the Center', required: true },
      { key: 'contact_role', label: 'Main contact and role', type: 'text', section: 'About the Center', required: true },
      { key: 'programs', label: 'Programs and services you run', type: 'textarea', section: 'About the Center', required: true, help: 'One per line: meals, classes, youth programs, pantry, lawn mowing, etc.' },
      { key: 'logo', label: 'Logo', type: 'file', section: 'Your brand', help: 'PNG or JPG, ideally with a transparent background.' },
      { key: 'brand_colors', label: 'Brand colors', type: 'text', section: 'Your brand', help: 'Example: navy and gold. Hex codes if you have them.' },
      { key: 'online_presence', label: 'Website and social media', type: 'textarea', section: 'Your brand', help: 'One link per line.' },
      { key: 'report_to', label: 'Who do you report to?', type: 'multiselect', section: 'Reporting', required: true, options: ['Food Bank', 'United Way', 'City / County', 'State', 'Foundations / donors', 'Board of directors', 'Other'] },
      { key: 'report_frequency', label: 'How often do you report?', type: 'multiselect', section: 'Reporting', required: true, options: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'On request'] },
      { key: 'report_hardest', label: 'What is the hardest part of putting a report together?', type: 'textarea', section: 'Reporting' },
      { key: 'count_meals', label: 'How do you count meals served and people helped today?', type: 'textarea', section: 'Daily operation', required: true },
      { key: 'who_enters', label: 'Who writes the information down or enters it?', type: 'text', section: 'Daily operation', required: true },
      { key: 'data_lives', label: 'Where does your information live today?', type: 'multiselect', section: 'Daily operation', required: true, options: ['Paper forms', 'Excel / Google Sheets', 'Another system', 'Email', 'Text messages / WhatsApp', 'In people\'s heads'] },
      { key: 'forms', label: 'Forms you use and send out', type: 'file', section: 'Daily operation', help: 'Upload samples (sign-in sheets, intake forms, volunteer forms, report templates). Photos are fine.' },
      { key: 'guest_info', label: 'What information do you collect about the people you serve?', type: 'textarea', section: 'Daily operation', help: 'Name, household size, zip code, phone, etc. Do not send personal data of real people here.' },
      { key: 'mow', label: 'Do you run a lawn mowing or similar service that needs scheduling?', type: 'yesno', section: 'Daily operation' },
      { key: 'volunteers', label: 'How many volunteers and staff would use a system?', type: 'number', section: 'Team and devices', required: true },
      { key: 'devices', label: 'What devices do you have?', type: 'multiselect', section: 'Team and devices', required: true, options: ['Desktop computer', 'Laptop', 'Tablet', 'Smartphones', 'Shared computer', 'None / very few'] },
      { key: 'internet', label: 'How is the internet at the Center?', type: 'select', section: 'Team and devices', required: true, options: ['Reliable', 'Drops sometimes', 'Drops often', 'No internet'] },
      { key: 'fix_first', label: 'If we could fix one thing first, what would it be?', type: 'textarea', section: 'To finish', required: true },
      { key: 'comments', label: 'Anything else we should know?', type: 'textarea', section: 'To finish' },
    ],
  },
];

// ---------------------------------------------------------------- textos del formulario público

export const INTAKE_UI = {
  es: {
    preparedFor: 'Preparado para',
    advisor: 'Tu asesor en MaalCa',
    progress: (done: number, total: number) => `${done} de ${total} obligatorias`,
    saving: 'Guardando…',
    saved: 'Guardado',
    saveError: 'No se pudo guardar. Revisa tu conexión; reintentamos solos.',
    required: 'Obligatoria',
    yes: 'Sí',
    no: 'No',
    choose: 'Elige una opción',
    upload: 'Subir archivo',
    uploading: 'Subiendo…',
    remove: 'Quitar',
    fileHelp: 'JPG, PNG, PDF, Excel o Word · máx. 4 MB',
    submit: 'Enviar a MaalCa',
    submitting: 'Enviando…',
    missing: 'Completa las preguntas obligatorias marcadas en rojo.',
    doneTitle: '¡Listo, gracias!',
    doneBody: 'Recibimos tus respuestas. Tu asesor las revisa y te contacta con los próximos pasos.',
    closedTitle: 'Este enlace ya no está activo',
    closedBody: 'Escribe a tu asesor de MaalCa si necesitas cambiar algo.',
    privacy: 'Tus datos se usan solo para configurar tu espacio en MaalCa. Los archivos quedan en almacenamiento privado.',
    resumeHint: 'Puedes cerrar esta página y volver con el mismo enlace: tus respuestas quedan guardadas.',
  },
  en: {
    preparedFor: 'Prepared for',
    advisor: 'Your MaalCa advisor',
    progress: (done: number, total: number) => `${done} of ${total} required`,
    saving: 'Saving…',
    saved: 'Saved',
    saveError: "Couldn't save. Check your connection; we'll retry automatically.",
    required: 'Required',
    yes: 'Yes',
    no: 'No',
    choose: 'Choose an option',
    upload: 'Upload file',
    uploading: 'Uploading…',
    remove: 'Remove',
    fileHelp: 'JPG, PNG, PDF, Excel or Word · max 4 MB',
    submit: 'Send to MaalCa',
    submitting: 'Sending…',
    missing: 'Please complete the required questions marked in red.',
    doneTitle: 'All set, thank you!',
    doneBody: 'We received your answers. Your advisor will review them and reach out with next steps.',
    closedTitle: 'This link is no longer active',
    closedBody: 'Contact your MaalCa advisor if you need to change anything.',
    privacy: 'Your information is only used to set up your MaalCa space. Files are kept in private storage.',
    resumeHint: 'You can close this page and come back with the same link: your answers are saved.',
  },
};
