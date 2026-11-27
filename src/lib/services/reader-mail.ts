// src/lib/services/reader-mail.ts — correos del club de lectores de un autor (ver ReaderMailer.cs en maalca-api):
// acceso (confirmar / entrar) y cartas. Van con el nombre y el logo del autor, en papel claro, sin "Enviado con
// MaalCa": el autor es la cara de su espacio. Cada carta lleva su enlace de baja y el header List-Unsubscribe.
import { Resend } from 'resend';
import { sanitizeRichText } from '@/lib/sanitize-html';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MaalCa <noreply@maalca.com>';
const BATCH = 100; // máximo de Resend por llamada

export interface ReaderMailAuthor {
  name: string;
  slug: string;
  logoUrl?: string | null;
  color?: string | null;
  replyTo?: string | null;
}

function from(author: ReaderMailAuthor): string {
  const addr = FROM_EMAIL.match(/<([^>]+)>/)?.[1] ?? FROM_EMAIL;
  const clean = author.name.replace(/["<>\r\n]/g, '').trim().slice(0, 60);
  return clean ? `${clean} <${addr}>` : FROM_EMAIL;
}

function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function accent(color?: string | null): string {
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : '#8E0F10';
}

function safeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? esc(url) : '#';
}

function layout(author: ReaderMailAuthor, body: string, footer: string): string {
  const logo = author.logoUrl && /^https:\/\//i.test(author.logoUrl)
    ? `<img src="${esc(author.logoUrl)}" alt="" width="56" height="56" style="display:block;margin:0 auto 10px;width:56px;height:56px;object-fit:contain;" />`
    : '';
  return `
<div style="background:#F2EDE4;padding:32px 12px;">
  <div style="max-width:560px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#1C1A20;">
    <div style="text-align:center;margin-bottom:24px;">
      ${logo}
      <div style="font-size:22px;font-style:italic;">${esc(author.name)}</div>
    </div>
    <div style="background:#FBF8F2;border:1px solid #D6CEC0;padding:28px 24px;font-size:17px;line-height:1.7;word-break:break-word;overflow-wrap:anywhere;">
      ${body}
    </div>
    <p style="text-align:center;font-family:'Courier New',monospace;font-size:12px;color:#5A5560;margin:20px 0 0;line-height:1.6;">${footer}</p>
  </div>
</div>`;
}

function button(label: string, url: string, color: string): string {
  return `<p style="margin:28px 0;"><a href="${safeUrl(url)}" style="display:inline-block;background:${color};color:#ffffff;padding:13px 26px;border-radius:2px;text-decoration:none;font-family:Georgia,serif;font-size:16px;">${esc(label)}</a></p>`;
}

/** Confirmar la suscripción (doble opt-in) o entrar. */
export async function sendReaderAccessEmail(p: {
  kind: 'confirm' | 'login';
  url: string;
  email: string;
  name?: string | null;
  language: 'es' | 'en';
  author: ReaderMailAuthor;
}): Promise<boolean> {
  if (!resend) {
    console.log('[reader-mail] Sin RESEND_API_KEY: no se manda el acceso');
    return false;
  }
  const es = p.language !== 'en';
  const color = accent(p.author.color);
  const hello = p.name ? (es ? `Hola, ${esc(p.name)}:` : `Hi ${esc(p.name)},`) : es ? 'Hola:' : 'Hi,';
  const subject = p.kind === 'confirm'
    ? (es ? `Confirma tu correo — ${p.author.name}` : `Confirm your email — ${p.author.name}`)
    : (es ? `Tu enlace para entrar — ${p.author.name}` : `Your sign-in link — ${p.author.name}`);
  const text = p.kind === 'confirm'
    ? (es ? `Confirma que quieres recibir las cartas de ${esc(p.author.name)}.` : `Confirm that you want to receive letters from ${esc(p.author.name)}.`)
    : (es ? `Este enlace te deja entrar a la página de ${esc(p.author.name)}. Vence en 30 minutos.` : `This link signs you in to ${esc(p.author.name)}'s page. It expires in 30 minutes.`);
  const cta = p.kind === 'confirm' ? (es ? 'Confirmar' : 'Confirm') : (es ? 'Entrar' : 'Sign in');
  const footer = es
    ? 'Si no pediste esto, ignora este correo: no pasa nada.'
    : "If you didn't ask for this, ignore this email: nothing will happen.";
  try {
    await resend.emails.send({
      from: from(p.author),
      to: p.email,
      ...(p.author.replyTo ? { replyTo: p.author.replyTo } : {}),
      subject,
      html: layout(p.author, `<p style="margin:0 0 14px;">${hello}</p><p style="margin:0;">${text}</p>${button(cta, p.url, color)}`, footer),
    });
    return true;
  } catch (err) {
    console.error('[reader-mail] acceso falló:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

export interface LetterRecipient {
  readerId: string;
  email: string;
  name?: string | null;
  language?: string | null;
  unsubscribeUrl: string;
}

/** Una carta a varios lectores, en lotes de Resend. Devuelve los readerId que salieron. */
export async function sendReaderLetter(p: {
  subject: string;
  bodyHtml: string;
  author: ReaderMailAuthor;
  recipients: LetterRecipient[];
}): Promise<string[]> {
  if (!resend) {
    console.log('[reader-mail] Sin RESEND_API_KEY: no se manda la carta');
    return [];
  }
  const body = sanitizeRichText(p.bodyHtml);
  const sent: string[] = [];
  for (let i = 0; i < p.recipients.length; i += BATCH) {
    const chunk = p.recipients.slice(i, i + BATCH);
    const emails = chunk.map((r) => {
      const es = r.language !== 'en';
      const footer = `${es ? 'Recibes esto porque te apuntaste a las cartas de' : "You're getting this because you signed up for letters from"} ${esc(p.author.name)}.<br/><a href="${safeUrl(r.unsubscribeUrl)}" style="color:#5A5560;">${es ? 'Dejar de recibirlas' : 'Unsubscribe'}</a>`;
      return {
        from: from(p.author),
        to: r.email,
        ...(p.author.replyTo ? { replyTo: p.author.replyTo } : {}),
        subject: p.subject,
        html: layout(p.author, body, footer),
        headers: /^https?:\/\//i.test(r.unsubscribeUrl) ? { 'List-Unsubscribe': `<${r.unsubscribeUrl}>` } : undefined,
      };
    });
    try {
      const res = await resend.batch.send(emails);
      if (res.error) {
        console.error('[reader-mail] lote falló:', res.error.message);
        continue;
      }
      sent.push(...chunk.map((r) => r.readerId));
    } catch (err) {
      console.error('[reader-mail] lote falló:', err instanceof Error ? err.message : String(err));
    }
  }
  return sent;
}
