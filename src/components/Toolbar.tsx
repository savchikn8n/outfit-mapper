import { CameraPreset, MannequinPresetId } from "../types/app";

interface ToolbarProps {
  mannequinPreset: MannequinPresetId;
  backgroundColor: string;
  shirtBaseColor: string;
  wireframe: boolean;
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onImportPng: () => void;
  onImportSvg: () => void;
  onExportViewer: () => void;
  onExportLayout: () => void;
  onExportProject: () => void;
  onCameraPreset: (preset: CameraPreset) => void;
  onBackgroundColor: (color: string) => void;
  onShirtBaseColor: (color: string) => void;
  onToggleWireframe: () => void;
}

export const Toolbar = ({
  backgroundColor,
  shirtBaseColor,
  wireframe,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onImportPng,
  onImportSvg,
  onExportViewer,
  onExportLayout,
  onExportProject,
  onCameraPreset,
  onBackgroundColor,
  onShirtBaseColor,
  onToggleWireframe
}: ToolbarProps) => (
  <header className="toolbar">
    <div className="toolbar__group">
      <button type="button" onClick={onNewProject}>
        New
      </button>
      <button type="button" onClick={onOpenProject}>
        Open
      </button>
      <button type="button" onClick={onSaveProject}>
        Save
      </button>
    </div>

    <div className="toolbar__group">
      <button type="button" onClick={onImportPng}>
        Import PNG
      </button>
      <button type="button" onClick={onImportSvg}>
        Import SVG
      </button>
    </div>

    <div className="toolbar__group">
      <button type="button" onClick={() => onCameraPreset("front")}>
        Front
      </button>
      <button type="button" onClick={() => onCameraPreset("back")}>
        Back
      </button>
      <button type="button" onClick={() => onCameraPreset("left")}>
        Left
      </button>
      <button type="button" onClick={() => onCameraPreset("right")}>
        Right
      </button>
      <button type="button" onClick={() => onCameraPreset("perspective")}>
        Perspective
      </button>
    </div>

    <div className="toolbar__group toolbar__group--controls">
      <label>
        Viewport
        <input
          type="color"
          value={backgroundColor}
          onChange={(event) => onBackgroundColor(event.target.value)}
        />
      </label>
      <label>
        Shirt
        <input
          type="color"
          value={shirtBaseColor}
          onChange={(event) => onShirtBaseColor(event.target.value)}
        />
      </label>
      <button type="button" onClick={onToggleWireframe} className={wireframe ? "is-active" : ""}>
        UV / Wireframe
      </button>
    </div>

    <div className="toolbar__group">
      <button type="button" onClick={onExportViewer}>
        Export 3D PNG
      </button>
      <button type="button" onClick={onExportLayout}>
        Export Layout PNG
      </button>
      <button type="button" onClick={onExportProject}>
        Export JSON
      </button>
    </div>
  </header>
);
