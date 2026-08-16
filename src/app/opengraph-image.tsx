import { ImageResponse } from 'next/og';

// Convención de archivo de Next.js: esto genera automáticamente el <meta property="og:image">
// y <meta name="twitter:image"> del dominio raíz (maalca.com sin slug). Antes no existía
// ningún og:image — layout.tsx solo tenía título/descripción — así que al compartir el link
// varios clientes (iMessage, Slack, etc.) mostraban un placeholder genérico en vez del logo de
// MaalCa. Las páginas de afiliado ([slug]/page.tsx) ya tienen su propio openGraph.images con el
// logo del negocio — esto solo cubre el dominio raíz.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a12 0%, #12121e 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #dc2626, #991b1b)',
            border: '4px solid #ffffff',
            marginBottom: 32,
          }}
        />
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: '#ffffff', letterSpacing: -2 }}>
          MaalCa
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#a3a3a3', marginTop: 12 }}>
          Ecosistema creativo dominicano
        </div>
      </div>
    ),
    { ...size },
  );
}
