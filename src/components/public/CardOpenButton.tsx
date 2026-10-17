'use client';

// Botón real que abre el detalle de una tarjeta del catálogo. Las tarjetas dejaron de ser un
// role="button" que contenía otros botones (agregar/quitar/reservar): botones anidados confunden
// a los lectores de pantalla y al teclado. Ahora la tarjeta sigue abriéndose al tocarla (onClick
// del contenedor, solo para ratón/táctil) y el NOMBRE es el control accesible: se llega con Tab y
// abre con Enter/Espacio. Hereda tipografía y color del título para no cambiar el diseño.

export function CardOpenButton({ onOpen, children }: { onOpen: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-haspopup="dialog"
      style={{
        display: 'inline',
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'none',
        font: 'inherit',
        color: 'inherit',
        letterSpacing: 'inherit',
        textTransform: 'inherit',
        textAlign: 'inherit',
        lineHeight: 'inherit',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
