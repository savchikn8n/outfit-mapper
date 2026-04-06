import Konva from "konva";
import { downloadDataUrl } from "../../utils/download";

export const exportCanvasAsPng = (filename: string, canvas: HTMLCanvasElement | null) => {
  if (!canvas) {
    return false;
  }

  downloadDataUrl(filename, canvas.toDataURL("image/png"));
  return true;
};

export const exportStageAsPng = (filename: string, stage: Konva.Stage | null) => {
  if (!stage) {
    return false;
  }

  downloadDataUrl(filename, stage.toDataURL({ pixelRatio: 2 }));
  return true;
};
