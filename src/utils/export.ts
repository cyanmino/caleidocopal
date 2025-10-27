export async function exportCanvasImage(canvas: HTMLCanvasElement, filename = 'carta-astral.png') {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
  if (!blob) {
    throw new Error('No se pudo generar la imagen');
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
