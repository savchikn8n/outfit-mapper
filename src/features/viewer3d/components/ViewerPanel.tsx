import { Canvas } from "@react-three/fiber";
import { AvatarGender, CameraPreset, MannequinPresetId } from "../../../types/app";
import { useI18n } from "../../../app/i18n";
import { ViewerScene } from "./ViewerScene";

interface ViewerPanelProps {
  textureCanvas: HTMLCanvasElement;
  textureRevision: number;
  shirtBaseColor: string;
  backgroundColor: string;
  wireframe: boolean;
  mannequinPreset: MannequinPresetId;
  avatarGender: AvatarGender;
  cameraPreset: CameraPreset;
  onViewportReady: (canvas: HTMLCanvasElement) => void;
}

export const ViewerPanel = (props: ViewerPanelProps) => {
  const { t } = useI18n();

  return (
    <div className="viewer-panel">
      <Canvas
        camera={{ position: [3.6, 2.2, 4.6], fov: 40 }}
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <ViewerScene {...props} />
      </Canvas>
      <div className="viewer-note">{t("viewer.placeholderNote")}</div>
    </div>
  );
};
