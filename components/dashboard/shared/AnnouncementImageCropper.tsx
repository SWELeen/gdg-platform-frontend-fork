"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

export interface AnnouncementImageCrop {
  x: number;
  y: number;
  zoom: number;
}

const ASPECT = 16 / 9;
const DEFAULT_CROP: AnnouncementImageCrop = { x: 0.5, y: 0.5, zoom: 1 };

export function AnnouncementImageCropper({
  src,
  alt,
  crop,
  onChange,
  instruction,
  zoomLabel,
  interactive = true,
  showControls = true,
}: {
  src: string;
  alt: string;
  crop: AnnouncementImageCrop;
  onChange: (crop: AnnouncementImageCrop) => void;
  instruction: string;
  zoomLabel: string;
  interactive?: boolean;
  showControls?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setFrame({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const baseCropWidth = image.width && image.height ? Math.min(image.width, image.height * ASPECT) : 0;
  const baseCropHeight = baseCropWidth ? baseCropWidth / ASPECT : 0;
  const cropWidth = baseCropWidth / crop.zoom;
  const cropHeight = baseCropHeight / crop.zoom;
  const renderedWidth = cropWidth && frame.width ? (image.width / cropWidth) * frame.width : frame.width;
  const renderedHeight = cropHeight && frame.height ? (image.height / cropHeight) * frame.height : frame.height;
  const imageStyle = image.width && image.height ? {
    width: renderedWidth,
    height: renderedHeight,
    left: frame.width / 2 - crop.x * renderedWidth,
    top: frame.height / 2 - crop.y * renderedHeight,
  } : undefined;

  function changeZoom(zoom: number) {
    if (!image.width || !image.height) return;
    const nextZoom = Math.max(1, Math.min(3, zoom));
    const width = Math.min(image.width, image.height * ASPECT) / nextZoom;
    const height = width / ASPECT;
    const x = width / image.width / 2;
    const y = height / image.height / 2;
    onChange({ x: Math.max(x, Math.min(1 - x, crop.x)), y: Math.max(y, Math.min(1 - y, crop.y)), zoom: nextZoom });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!interactive || !image.width || !image.height) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const last = dragRef.current;
    if (!last || last.pointerId !== event.pointerId || !renderedWidth || !renderedHeight) return;
    const cropX = cropWidth / image.width / 2;
    const cropY = cropHeight / image.height / 2;
    onChange({
      ...crop,
      x: Math.max(cropX, Math.min(1 - cropX, crop.x - (event.clientX - last.x) / renderedWidth)),
      y: Math.max(cropY, Math.min(1 - cropY, crop.y - (event.clientY - last.y) / renderedHeight)),
    });
    dragRef.current = { ...last, x: event.clientX, y: event.clientY };
  }

  return (
    <div className="grid gap-3">
      <div
        ref={frameRef}
        className={`relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black ${interactive ? "touch-none cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
        aria-label={instruction}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- image is a local object URL used for pre-upload crop selection. */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(event) => setImage({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          className="pointer-events-none absolute max-w-none select-none"
          style={imageStyle}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 border border-white/50 shadow-[inset_0_0_0_999px_rgba(0,0,0,0.08)]" />
      </div>
      {showControls && <>
        <label className="grid gap-1.5 text-xs font-medium text-foreground">
          <span>{zoomLabel}</span>
          <input type="range" min="1" max="3" step="0.01" value={crop.zoom} onChange={(event) => changeZoom(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>
        <p className="text-xs text-muted">{instruction}</p>
      </>}
    </div>
  );
}

export async function createCroppedAnnouncementImage(file: File, crop: AnnouncementImageCrop): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const widthAtZoomOne = Math.min(sourceWidth, sourceHeight * ASPECT);
    const sourceWidthCrop = widthAtZoomOne / crop.zoom;
    const sourceHeightCrop = sourceWidthCrop / ASPECT;
    const sourceX = Math.max(0, Math.min(sourceWidth - sourceWidthCrop, crop.x * sourceWidth - sourceWidthCrop / 2));
    const sourceY = Math.max(0, Math.min(sourceHeight - sourceHeightCrop, crop.y * sourceHeight - sourceHeightCrop / 2));
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sourceX, sourceY, sourceWidthCrop, sourceHeightCrop, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not process this image.")), "image/jpeg", 0.88);
    });
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-cropped.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export { DEFAULT_CROP };
