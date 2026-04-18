'use client'
import { useState } from 'react'

const WA_PHONE = '16078574226'

export default function ReservationForm({ phone }: { phone: string }) {
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [people, setPeople] = useState('2')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lines = [
      '🍽️ *Nueva Reservación — The Little Dominican*',
      '',
      `👤 Nombre: ${name || '(sin nombre)'}`,
      `📞 Teléfono: ${tel || '(sin teléfono)'}`,
      `📅 Fecha: ${date || '(sin fecha)'}`,
      `🕒 Hora: ${time || '(sin hora)'}`,
      `👥 Personas: ${people}`,
    ]
    if (note.trim()) {
      lines.push('', `📝 Nota: ${note.trim()}`)
    }
    lines.push('', '¡Gracias! Esperamos tu confirmación.')

    const msg = encodeURIComponent(lines.join('\n'))
    const url = `https://wa.me/${WA_PHONE}?text=${msg}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        <FormField label="Nombre"   value={name} onChange={setName} placeholder="Tu nombre"      type="text" required />
        <FormField label="Teléfono" value={tel}  onChange={setTel}  placeholder="(607) 000-0000" type="tel"  required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        <FormField label="Fecha" value={date} onChange={setDate} type="date" required />
        <FormField label="Hora"  value={time} onChange={setTime} type="time" required />
      </div>
      <div>
        <Label>Personas</Label>
        <select
          className="tld-inp"
          style={{ cursor: 'pointer' }}
          value={people}
          onChange={e => setPeople(e.target.value)}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Nota especial (opcional)</Label>
        <textarea
          className="tld-inp"
          rows={2}
          placeholder="Alergias, celebración, mesa afuera..."
          style={{ resize: 'none' }}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-p" style={{ justifyContent: 'center', marginTop: '.25rem' }}>
        💬 Reservar por WhatsApp
      </button>
      <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--tl)' }}>
        Al enviar se abre WhatsApp con tu reserva — la confirmamos allí.<br />
        O llámanos al{' '}
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          style={{ color: 'var(--p)', fontWeight: 600, textDecoration: 'none' }}
        >
          {phone}
        </a>
      </p>
    </form>
  )
}

function FormField({
  label, value, onChange, placeholder, type, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type: string
  required?: boolean
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="tld-inp"
      />
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="tld-label" style={{ marginBottom: '6px' }}>{children}</div>
  )
}
