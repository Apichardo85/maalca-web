"use client";
import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import {
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  Product,
  Customer,
  InvoiceLine,
  PaymentMethod,
  calculateLineTotals,
  calculateInvoiceTotals,
  formatCurrency
} from "@/lib/types/invoicing.types";
interface NewSalePanelProps {
  onClose: () => void;
  onSave?: (invoiceData: Record<string, unknown>) => void;
}
/**
 * Panel de Nueva Venta - POS simple
 */
export function NewSalePanel({ onClose, onSave }: NewSalePanelProps) {
  const { config } = useAffiliate();
  const currency = config?.settings.currency || "DOP";
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(MOCK_CUSTOMERS[0]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customerSearch]);
  const filteredProducts = useMemo(() => {
    if (!productSearch) return MOCK_PRODUCTS.filter(p => p.isActive);
    return MOCK_PRODUCTS.filter(p =>
      p.isActive &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
       p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [productSearch]);
  const addProduct = (product: Product) => {
    const existingLineIndex = lines.findIndex(l => l.productId === product.id);
    if (existingLineIndex >= 0) {
      const updatedLines = [...lines];
      updatedLines[existingLineIndex].quantity += 1;
      const recalculated = calculateLineTotals(updatedLines[existingLineIndex]);
      updatedLines[existingLineIndex] = { ...recalculated, id: updatedLines[existingLineIndex].id };
      setLines(updatedLines);
    } else {
      const newLine = calculateLineTotals({
        productId: product.id,
        sku: product.sku,
        description: product.name,
        quantity: 1,
        unitPrice: product.unitPrice,
        taxRate: product.taxRate,
        discount: 0,
        discountType: "percentage"
      });
      setLines([...lines, { ...newLine, id: `line-${Date.now()}` }]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };
  const updateLineQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLine(lineId);
      return;
    }
    const updatedLines = lines.map(line => {
      if (line.id === lineId) {
        const recalculated = calculateLineTotals({ ...line, quantity });
        return { ...recalculated, id: line.id };
      }
      return line;
    });
    setLines(updatedLines);
  };
  const removeLine = (lineId: string) => {
    setLines(lines.filter(l => l.id !== lineId));
  };
  const totals = useMemo(() => calculateInvoiceTotals(lines), [lines]);
  const handleConfirmSale = () => {
    if (lines.length === 0) {
      alert("Debe agregar al menos un producto/servicio");
      return;
    }
    const invoiceData = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      lines,
      paymentMethod,
      currency,
      ...totals,
      status: "paid",
      date: new Date().toISOString()
    };
    console.log("Nueva venta:", invoiceData);
    onSave?.(invoiceData);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Venta</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">POS - Punto de Venta</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selector de Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={customerSearch || selectedCustomer.name}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in-down">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch("");
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          {customer.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Buscador de Productos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agregar Producto/Servicio
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  {showProductDropdown && productSearch && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in-down">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku}</p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(product.unitPrice, currency as string)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Tabla de líneas */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Artículos</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {lines.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No hay artículos agregados
                    </div>
                  ) : (
                    lines.map((line) => (
                      <div key={line.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{line.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(line.unitPrice, currency as string)} × {line.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateLineQuantity(line.id, line.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() => updateLineQuantity(line.id, line.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              +
                            </button>
                          </div>
                          <div className="w-24 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(line.lineTotal, currency as string)}
                          </div>
                          <button
                            onClick={() => removeLine(line.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Columna derecha - Resumen y pago */}
            <div className="space-y-6">
              {/* Resumen */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(totals.subtotal, currency as string)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Impuestos:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(totals.taxTotal, currency as string)}</span>
                  </div>
                  {totals.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuentos:</span>
                      <span>-{formatCurrency(totals.discountTotal, currency as string)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-xl text-gray-900 dark:text-white">
                        {formatCurrency(totals.total, currency as string)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "cash", label: "💵 Efectivo" },
                    { value: "card", label: "💳 Tarjeta" },
                    { value: "transfer", label: "🏦 Transferencia" },
                    { value: "mixed", label: "🔀 Mixto" }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        paymentMethod === method.value
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirmSale}
                  disabled={lines.length === 0}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Confirmar Venta
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
