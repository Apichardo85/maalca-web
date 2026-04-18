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

interface Props {
  src: string;
  aspect?: number;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}

// Produce a cropped JPEG blob using an offscreen canvas
async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("No se pudo leer la imagen"));
    i.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
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
      (b) => (b ? resolve(b) : reject(new Error("toBlob falló"))),
      "image/jpeg",
      0.9,
    );
  });
}

export function ImageCropper({
  src,
  aspect = 4 / 3,
  onCancel,
  onCropped,
  busy,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  const onCropComplete = useCallback((_c: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(src, area);
      onCropped(blob);
    } catch (err) {
      alert(`Error al recortar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setWorking(false);
    }
  };

  const disabled = busy || working;

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden">
        <Cropper
          image={src}
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
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-blue-600"
        />
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">
        Arrastra la imagen para moverla, usa el zoom o pellizca en el móvil. El área
        visible es la que se guardará.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={disabled}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm} disabled={disabled || !area}>
          {working ? "Procesando..." : "Usar esta foto"}
        </Button>
      </div>
    </div>
  );
}
