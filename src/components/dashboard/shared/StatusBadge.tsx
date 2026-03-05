/**
 * Status Badge Component - Reutilizable en todo el dashboard
 *
 * Proporciona badges consistentes para estados en Queue, Salon, Gift Cards, etc.
 */

interface StatusBadgeProps {
  status: string;
  variant?: 'queue' | 'salon' | 'giftcard' | 'appointment' | 'invoice' | 'generic';
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES = {
  // Queue statuses
  queue: {
    waiting: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'En Espera'
    },
    called: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Llamado'
    },
    in_service: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-800 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700',
      label: 'En Servicio'
    },
    done: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Finalizado'
    },
    no_show: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      label: 'No Asistió'
    }
  },

  // Salon statuses
  salon: {
    available: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Disponible'
    },
    occupied: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Ocupada'
    },
    cleaning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'En Limpieza'
    },
    paused: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: 'En Pausa'
    }
  },

  // Gift Card statuses
  giftcard: {
    active: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Activa'
    },
    partial: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Parcial'
    },
    redeemed: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: 'Canjeada'
    },
    expired: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      label: 'Expirada'
    }
  },

  // Appointment statuses
  appointment: {
    scheduled: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Programada'
    },
    confirmed: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Confirmada'
    },
    in_progress: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-800 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700',
      label: 'En Progreso'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Completada'
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      label: 'Cancelada'
    },
    no_show: {
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      text: 'text-orange-800 dark:text-orange-400',
      border: 'border-orange-300 dark:border-orange-700',
      label: 'No Asistió'
    }
  },

  // Invoice statuses
  invoice: {
    draft: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: 'Borrador'
    },
    sent: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Enviada'
    },
    paid: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      label: 'Pagada'
    },
    overdue: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      label: 'Vencida'
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: 'Cancelada'
    }
  },

  // Generic fallback
  generic: {
    default: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: 'Unknown'
    }
  }
};

const SIZE_STYLES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

export function StatusBadge({ status, variant = 'generic', size = 'md' }: StatusBadgeProps) {
  const variantStyles = STATUS_STYLES[variant] || STATUS_STYLES.generic;
  const style = variantStyles[status as keyof typeof variantStyles] || variantStyles.default || STATUS_STYLES.generic.default;
  const sizeClass = SIZE_STYLES[size];

  return (
    <span
      className={`inline-flex items-center ${sizeClass} rounded-full font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}
