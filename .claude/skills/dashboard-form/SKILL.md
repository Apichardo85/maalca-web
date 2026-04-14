# Skill: Dashboard Form

Genera formularios modales validados con feedback real para módulos del dashboard.

## Contexto

Actualmente TODOS los formularios del dashboard hacen `console.log("Nueva cita:", data)` en lugar de enviar datos. Los componentes `useFormValidation`, `FormField`, `SelectField`, `TextAreaField`, `Toast`, y `Modal` existen pero ningún módulo los usa. Este skill los conecta.

## Estructura generada

```
src/app/dashboard/[affiliateId]/{module}/
└── components/
    └── {Module}FormModal.tsx    # Form modal con validación + submit real
```

## Reglas obligatorias

### 1. Usar useFormValidation — SIEMPRE

```typescript
import { useFormValidation, EMAIL_PATTERN, PHONE_PATTERN } from "@/hooks/useFormValidation";

const {
  formData,
  errors,
  touched,
  isSubmitting,
  setIsSubmitting,
  handleChange,
  handleBlur,
  validateAllFields,
  resetForm,
  getFieldProps,
  isValid,
} = useFormValidation(
  { name: "", email: "", phone: "", notes: "" },
  {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: EMAIL_PATTERN },
    phone: { pattern: PHONE_PATTERN },
    notes: { maxLength: 500 },
  }
);
```

### 2. Usar FormField/SelectField — NO inputs manuales

```typescript
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";

// ✅ CORRECTO
<FormField
  label="Nombre del cliente"
  {...getFieldProps("name")}
  error={touched.name ? errors.name : undefined}
  required
/>

// ❌ INCORRECTO
<input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="border rounded p-2"
/>
```

### 3. Submission flow — Service layer + Toast

```typescript
import { appointmentService } from "@/lib/dashboard/appointment-service";
import { useToast } from "@/hooks/useToast"; // o importar Toast directamente

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateAllFields()) {
    // Focus primer campo con error
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      document.querySelector<HTMLInputElement>(`[name="${firstError}"]`)?.focus();
    }
    return;
  }

  setIsSubmitting(true);
  try {
    await appointmentService.create(affiliateId, {
      customerId: formData.customerId,
      serviceId: formData.serviceId,
      date: formData.date,
      time: formData.time,
      notes: formData.notes || undefined,
    });

    // Feedback al usuario
    toast.success("Cita creada exitosamente");
    resetForm();
    onClose();
    onSuccess?.(); // Callback para que el padre refresque data

  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Error al crear la cita"
    );
  } finally {
    setIsSubmitting(false);
  }
};
```

**NUNCA `console.log` como handler.** Siempre llamar al service + toast.

### 4. Modal wrapper — Usar componente Modal existente

```typescript
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/buttons/button";

<Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita" size="lg">
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* FormFields aquí */}

    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
      <Button variant="outline" onClick={onClose} type="button">
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Crear Cita
      </Button>
    </div>
  </form>
</Modal>
```

### 5. Props del form modal

```typescript
interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;     // Para refrescar data en el padre
  affiliateId: string;
  editData?: Appointment;     // Opcional: para modo edición
}
```

### 6. Modo edición (opcional)

Si el modal soporta edición, pre-llenar el form con `editData`:

```typescript
useEffect(() => {
  if (editData) {
    // Set form data from editData
  }
}, [editData]);

// Submit llama update en vez de create
const isEditing = !!editData;
await isEditing
  ? service.update(affiliateId, editData.id, formData)
  : service.create(affiliateId, formData);
```

## Componentes obligatorios

| Componente | Import | Uso |
|---|---|---|
| `useFormValidation` | `@/hooks/useFormValidation` | Validación + state del form |
| `FormField` | `@/components/ui/FormField` | Inputs de texto |
| `SelectField` | `@/components/ui/SelectField` | Dropdowns |
| `TextAreaField` | `@/components/ui/TextAreaField` | Campos de texto largo |
| `Modal` | `@/components/ui/Modal` | Wrapper modal con backdrop blur |
| `Button` | `@/components/ui/buttons/button` | Botones con loading state |
| `*Service` | `@/lib/dashboard/*-service` | Llamadas al service layer |

## Checklist antes de completar

- [ ] Usa `useFormValidation` con reglas definidas
- [ ] Todos los inputs usan `FormField`/`SelectField`/`TextAreaField`
- [ ] Submit llama al service layer (NO `console.log`)
- [ ] Muestra toast de éxito/error
- [ ] Botón submit tiene `isLoading` durante envío
- [ ] Campos disabled durante envío
- [ ] Focus al primer campo con error si validación falla
- [ ] Llama `onSuccess` callback al completar
- [ ] `resetForm()` al cerrar
- [ ] `npm run build` pasa sin errores

## Referencias

- `src/hooks/useFormValidation.ts` — Hook de validación (EMAIL_PATTERN, PHONE_PATTERN, NAME_PATTERN)
- `src/components/ui/FormField.tsx` — Input con error display
- `src/components/ui/SelectField.tsx` — Dropdown
- `src/components/ui/TextAreaField.tsx` — Textarea
- `src/components/ui/Modal.tsx` — Modal con backdrop blur
- `src/components/ui/buttons/button.tsx` — Button con isLoading
- `src/lib/dashboard/appointment-service.ts` — Ejemplo de service layer
