'use client';

// Atributos de tienda de un producto (Retail): marca, variante, peso/medidas para cotizar envíos, material
// peligroso (perfumes → solo envío terrestre), advertencia de asfixia (juguetes) y reglas de cantidad por pedido.
// Lo usan NewItemForm y EditForm. Todo es opcional: un producto sin nada de esto se vende como siempre.
import type { ChokingWarning, RetailAttributes } from '@/lib/commerce';

export interface RetailAttributesForm {
  brand: string;
  variantGroup: string;
  variantLabel: string;
  weightOz: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
  hazmat: '' | 'limited_quantity';
  chokingWarning: '' | ChokingWarning;
  minOrderQty: string;
  orderQtyMultiple: string;
  maxPerOrder: string;
}

const str = (v: number | string | null | undefined) => (v == null ? '' : String(v));

export function retailFormFrom(r: RetailAttributes | null | undefined): RetailAttributesForm {
  return {
    brand: str(r?.brand),
    variantGroup: str(r?.variantGroup),
    variantLabel: str(r?.variantLabel),
    weightOz: str(r?.weightOz),
    lengthIn: str(r?.lengthIn),
    widthIn: str(r?.widthIn),
    heightIn: str(r?.heightIn),
    hazmat: r?.hazmat ?? '',
    chokingWarning: r?.chokingWarning ?? '',
    minOrderQty: str(r?.minOrderQty),
    orderQtyMultiple: str(r?.orderQtyMultiple),
    maxPerOrder: str(r?.maxPerOrder),
  };
}

/** Lo que se manda al API: el objeto completo (el API reemplaza todos los campos), con vacíos como null. */
export function retailPayload(f: RetailAttributesForm): RetailAttributes {
  const num = (v: string) => (v.trim() === '' ? null : Number(v));
  const int = (v: string) => (v.trim() === '' ? null : Math.max(0, Math.floor(Number(v))));
  const text = (v: string) => (v.trim() === '' ? null : v.trim());
  return {
    brand: text(f.brand),
    variantGroup: text(f.variantGroup),
    variantLabel: text(f.variantLabel),
    weightOz: num(f.weightOz),
    lengthIn: num(f.lengthIn),
    widthIn: num(f.widthIn),
    heightIn: num(f.heightIn),
    hazmat: f.hazmat === '' ? null : f.hazmat,
    chokingWarning: f.chokingWarning === '' ? null : f.chokingWarning,
    minOrderQty: int(f.minOrderQty),
    orderQtyMultiple: int(f.orderQtyMultiple),
    maxPerOrder: int(f.maxPerOrder),
  };
}

const inputCls =
  'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none';
const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1';
const hintCls = 'mt-1 text-xs text-neutral-500 dark:text-neutral-400';

export function RetailAttributesEditor({
  value,
  onChange,
  getText,
}: {
  value: RetailAttributesForm;
  onChange: (next: RetailAttributesForm) => void;
  getText: (es: string, en: string) => string;
}) {
  const set = (k: keyof RetailAttributesForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <details className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 group" open={hasAny(value)}>
      <summary className="cursor-pointer text-sm font-semibold text-neutral-800 dark:text-neutral-200 select-none">
        {getText('Detalles de tienda y envío (opcional)', 'Store & shipping details (optional)')}
      </summary>

      <div className="mt-4 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{getText('Marca', 'Brand')}</label>
            <input className={inputCls} value={value.brand} onChange={set('brand')} maxLength={120} placeholder={getText('Ej. Dior', 'E.g. Dior')} />
          </div>
          <div>
            <label className={labelCls}>{getText('Producto base (variantes)', 'Base product (variants)')}</label>
            <input className={inputCls} value={value.variantGroup} onChange={set('variantGroup')} maxLength={80} placeholder={getText('Ej. Sauvage EDT', 'E.g. Sauvage EDT')} />
          </div>
          <div>
            <label className={labelCls}>{getText('Esta variante', 'This variant')}</label>
            <input className={inputCls} value={value.variantLabel} onChange={set('variantLabel')} maxLength={60} placeholder={getText('Ej. 100 ml', 'E.g. 100 ml')} />
          </div>
        </div>
        <p className={hintCls + ' -mt-3'}>
          {getText(
            'Productos con el mismo "producto base" se muestran como una sola ficha con selector (50 ml / 100 ml). Cada variante mantiene su precio, stock y código.',
            'Products with the same "base product" show as one card with a selector (50 ml / 100 ml). Each variant keeps its own price, stock and code.',
          )}
        </p>

        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>{getText('Peso (oz)', 'Weight (oz)')}</label>
              <input type="number" min="0" step="0.1" className={inputCls} value={value.weightOz} onChange={set('weightOz')} />
            </div>
            <div>
              <label className={labelCls}>{getText('Largo (in)', 'Length (in)')}</label>
              <input type="number" min="0" step="0.1" className={inputCls} value={value.lengthIn} onChange={set('lengthIn')} />
            </div>
            <div>
              <label className={labelCls}>{getText('Ancho (in)', 'Width (in)')}</label>
              <input type="number" min="0" step="0.1" className={inputCls} value={value.widthIn} onChange={set('widthIn')} />
            </div>
            <div>
              <label className={labelCls}>{getText('Alto (in)', 'Height (in)')}</label>
              <input type="number" min="0" step="0.1" className={inputCls} value={value.heightIn} onChange={set('heightIn')} />
            </div>
          </div>
          <p className={hintCls}>
            {getText('Del producto ya empacado. Hacen falta para cotizar envíos con la paquetería.', 'Of the packed product. Needed to quote shipping with carriers.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{getText('Material peligroso para envío', 'Hazardous for shipping')}</label>
            <select className={inputCls} value={value.hazmat} onChange={set('hazmat')}>
              <option value="">{getText('No', 'No')}</option>
              <option value="limited_quantity">{getText('Sí — inflamable en cantidad limitada (perfume, colonia, esmalte)', 'Yes — flammable, limited quantity (perfume, cologne, nail polish)')}</option>
            </select>
            <p className={hintCls}>
              {getText('Con "Sí", el checkout solo ofrece envíos terrestres.', 'With "Yes", checkout only offers ground shipping.')}
            </p>
          </div>
          <div>
            <label className={labelCls}>{getText('Advertencia de asfixia (juguetes)', 'Choking hazard warning (toys)')}</label>
            <select className={inputCls} value={value.chokingWarning} onChange={set('chokingWarning')}>
              <option value="">{getText('Ninguna', 'None')}</option>
              <option value="small_parts">{getText('Piezas pequeñas (menores de 3 años)', 'Small parts (under 3)')}</option>
              <option value="small_ball">{getText('Pelota pequeña', 'Small ball')}</option>
              <option value="marble">{getText('Canica', 'Marble')}</option>
              <option value="balloon">{getText('Globo (menores de 8 años)', 'Balloon (under 8)')}</option>
            </select>
            <p className={hintCls}>
              {getText('Se muestra en la ficha del producto, como pide la ley para la venta online.', 'Shown on the product page, as required for online sales.')}
            </p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>{getText('Mínimo por pedido', 'Min. per order')}</label>
              <input type="number" min="0" step="1" className={inputCls} value={value.minOrderQty} onChange={set('minOrderQty')} />
            </div>
            <div>
              <label className={labelCls}>{getText('Se vende en múltiplos de', 'Sold in multiples of')}</label>
              <input type="number" min="0" step="1" className={inputCls} value={value.orderQtyMultiple} onChange={set('orderQtyMultiple')} />
            </div>
            <div>
              <label className={labelCls}>{getText('Máximo por pedido', 'Max. per order')}</label>
              <input type="number" min="0" step="1" className={inputCls} value={value.maxPerOrder} onChange={set('maxPerOrder')} />
            </div>
          </div>
          <p className={hintCls}>
            {getText('Vacío = sin regla. Ej.: cajas de 6 → múltiplos de 6.', 'Empty = no rule. E.g. boxes of 6 → multiples of 6.')}
          </p>
        </div>
      </div>
    </details>
  );
}

function hasAny(v: RetailAttributesForm): boolean {
  return Object.values(v).some((x) => x !== '');
}
