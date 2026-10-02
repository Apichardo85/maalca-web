"use client";

/**
 * ImageCropper — recortar + zoom + pan para la foto del plato.
 *
 * Props:
 *  - src: object URL o dataURL de la imagen cruda
 *  - aspect: relación de aspecto (default 4/3 — matches card display)
 *  - onCancel: cerrar sin aplicar
 *  - onCropped(blob): recibe el blob ya recortado como JPEG
 *
 * Usa react-easy-crop para el UI del gesture. El crop final se hace en
 * canvas para producir un JPEG compacto listo para subir.
 */

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/buttons";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

interface Props {
  src: string;
  aspect?: number;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}

// Produce a cropped JPEG blob using an offscreen canvas
async function getCroppedBlob(
  src: string,
  area: Area,
  getText: (es: string, en: string) => string,
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error(getText("No se pudo leer la imagen", "Couldn't read the image")));
    i.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(getText("Canvas no disponible", "Canvas not available"));
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(getText("toBlob falló", "toBlob failed")))),
      "image/jpeg",
      0.9,
    );
  });
}

export function ImageCropper({
  src,
  aspect: aspectProp = 1,
  onCancel,
  onCropped,
  busy,
}: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === "es" ? es : en);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);
  const [aspect, setAspect] = useState(aspectProp);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_c: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(src, area, getText);
      onCropped(blob);
    } catch (err) {
      setError(`${getText('Error al recortar', 'Crop error')}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setWorking(false);
    }
  };

  const disabled = busy || working;
  const ratios: Array<{ label: string; value: number }> = [
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {getText('Formato', 'Shape')}
        </span>
        {ratios.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => { setAspect(r.value); setCrop({ x: 0, y: 0 }); setZoom(1); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              Math.abs(aspect - r.value) < 0.001
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-black rounded-xl overflow-hidden touch-none">
        <Cropper
          image={src}
          minZoom={1}
          maxZoom={4}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          objectFit="contain"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-12">
          Zoom
        </label>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-blue-600"
        />
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">
        {getText(
          'Arrastra para mover, pellizca o usa el zoom. Lo que ves dentro del marco es lo que se guarda. 1:1 es el formato de las tarjetas del menú.',
          'Drag to move, pinch or use the zoom. What is inside the frame is what gets saved. 1:1 matches the menu cards.',
        )}
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={disabled}>
          {getText('Cancelar', 'Cancel')}
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm} disabled={disabled || !area}>
          {working ? getText('Procesando...', 'Processing...') : getText('Usar esta foto', 'Use this photo')}
        </Button>
      </div>
    </div>
  );
}
