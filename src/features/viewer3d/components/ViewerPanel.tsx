import { Canvas } from "@react-three/fiber";
import { CameraPreset, MannequinPresetId } from "../../../types/app";
import { ViewerScene } from "./ViewerScene";

interface ViewerPanelProps {
  textureCanvas: HTMLCanvasElement;
  textureRevision: number;
  shirtBaseColor: string;
  backgroundColor: string;
  wireframe: boolean;
  mannequinPreset: MannequinPresetId;
  cameraPreset: CameraPreset;
  onViewportReady: (canvas: HTMLCanvasElement) => void;
}

export const ViewerPanel = (props: ViewerPanelProps) => (
  <div className="viewer-panel">
    <Canvas
      camera={{ position: [3.6, 2.2, 4.6], fov: 40 }}
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <ViewerScene {...props} />
    </Canvas>
    <div className="viewer-note">
      Placeholder mannequin geometry is active. Replace it later with
      `/public/models/mannequin.glb` and a dedicated shirt mesh when final assets are ready.
    </div>
  </div>
);
