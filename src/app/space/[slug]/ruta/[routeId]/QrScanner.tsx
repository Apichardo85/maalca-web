'use client';

import { useEffect, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

type Detector = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (opts: { formats: string[] }) => Detector;

/**
 * Escáner de QR con la cámara (BarcodeDetector, disponible en Chrome de Android). Si el navegador no lo soporta
 * o no hay permiso de cámara, queda el campo para escribir el código del anaquel a mano.
 */
export function QrScanner({ onResult, onClose }: { onResult: (raw: string) => void; onClose: () => void }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState('');

  useEffect(() => {
    const Ctor = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
      setError(getText('Este navegador no puede leer QR con la cámara. Escribe el código del anaquel.', "This browser can't read QR codes. Type the rack code."));
      return;
    }
    let stopped = false;
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const detector = new Ctor({ formats: ['qr_code'] });
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const found = await detector.detect(videoRef.current);
            if (found[0]?.rawValue) {
              stopped = true;
              onResultRef.current(found[0].rawValue);
              return;
            }
          } catch {
            // Un cuadro que no se pudo leer no es error: se intenta con el siguiente.
          }
          requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setError(getText('No se pudo abrir la cámara. Escribe el código del anaquel.', "Couldn't open the camera. Type the rack code."));
      }
    })();
    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 p-4">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {!error && <video ref={videoRef} playsInline muted className="w-full flex-1 rounded-2xl bg-black object-cover" />}
        {error && <p className="rounded-xl bg-white p-4 text-sm text-gray-800">{error}</p>}
        <div className="mt-3 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={getText('Código del anaquel', 'Rack code')}
            className="min-w-0 flex-1 rounded-lg bg-white px-3 py-3 text-sm text-gray-900"
          />
          <button
            type="button"
            onClick={() => manual.trim() && onResult(manual.trim())}
            className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900"
          >
            {getText('Usar', 'Use')}
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-3 rounded-full bg-white/15 px-4 py-3 text-sm font-semibold text-white">
          {getText('Cancelar', 'Cancel')}
        </button>
      </div>
    </div>
  );
}
