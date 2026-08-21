'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface RecipeLine {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
}

export interface RecipeInventoryOption {
  id: string;
  name: string;
}

interface Props {
  inventoryOptions: RecipeInventoryOption[];
  value: RecipeLine[];
  onChange: (lines: RecipeLine[]) => void;
}

/**
 * Receta de un plato (Restaurante): qué InventoryItem(s) consume UNA unidad vendida, y cuánto.
 * Sin esto, vender el plato nunca tocaba el stock de ningún ingrediente — ver
 * OrderService.DecrementStockAsync (camino de receta) y task #291/#292.
 */
export function RecipeEditor({ inventoryOptions, value, onChange }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [pendingItemId, setPendingItemId] = useState('');
  const [pendingQty, setPendingQty] = useState('1');

  const usedIds = new Set(value.map((l) => l.inventoryItemId));
  const available = inventoryOptions.filter((o) => !usedIds.has(o.id));

  function addLine() {
    if (!pendingItemId) return;
    const opt = inventoryOptions.find((o) => o.id === pendingItemId);
    if (!opt) return;
    const qty = Number(pendingQty);
    if (!qty || qty <= 0) return;
    onChange([...value, { inventoryItemId: opt.id, inventoryItemName: opt.name, quantity: qty }]);
    setPendingItemId('');
    setPendingQty('1');
  }

  function removeLine(id: string) {
    onChange(value.filter((l) => l.inventoryItemId !== id));
  }

  function updateQty(id: string, qty: string) {
    const n = Number(qty);
    onChange(value.map((l) => (l.inventoryItemId === id ? { ...l, quantity: n > 0 ? n : l.quantity } : l)));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((line) => (
            <li
              key={line.inventoryItemId}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            >
              <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">{line.inventoryItemName}</span>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={line.quantity}
                onChange={(e) => updateQty(line.inventoryItemId, e.target.value)}
                className="w-20 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeLine(line.inventoryItemId)}
                className="text-xs text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                aria-label={getText('Quitar ingrediente', 'Remove ingredient')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {inventoryOptions.length === 0 ? (
        <p className="text-xs text-neutral-400">
          {getText(
            'No hay items de Inventario todavía — agrégalos en Inventario para poder ligarlos aquí como ingredientes.',
            "No Inventory items yet — add them in Inventory so you can link them here as ingredients.",
          )}
        </p>
      ) : available.length === 0 ? (
        <p className="text-xs text-neutral-400">
          {getText('Todos los ingredientes disponibles ya están en la receta.', 'All available ingredients are already in the recipe.')}
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <select
            value={pendingItemId}
            onChange={(e) => setPendingItemId(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
          >
            <option value="">{getText('Elegir ingrediente…', 'Choose ingredient…')}</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={pendingQty}
            onChange={(e) => setPendingQty(e.target.value)}
            className="w-20 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-2 text-sm text-gray-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addLine}
            disabled={!pendingItemId}
            className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {getText('Agregar', 'Add')}
          </button>
        </div>
      )}
    </div>
  );
}
