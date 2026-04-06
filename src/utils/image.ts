export const loadImageElement = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${source}`));
    image.src = source;
  });

export const fitImageToBounds = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);

  return {
    width: Math.max(24, Math.round(sourceWidth * scale)),
    height: Math.max(24, Math.round(sourceHeight * scale))
  };
};

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
