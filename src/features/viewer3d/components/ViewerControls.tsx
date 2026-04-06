import { CameraPreset } from "../../../types/app";
import { useI18n } from "../../../app/i18n";

interface ViewerControlsProps {
  backgroundColor: string;
  shirtBaseColor: string;
  wireframe: boolean;
  onCameraPreset: (preset: CameraPreset) => void;
  onBackgroundColor: (color: string) => void;
  onShirtBaseColor: (color: string) => void;
  onToggleWireframe: () => void;
}

export const ViewerControls = ({
  backgroundColor,
  shirtBaseColor,
  wireframe,
  onCameraPreset,
  onBackgroundColor,
  onShirtBaseColor,
  onToggleWireframe
}: ViewerControlsProps) => {
  const { t } = useI18n();

  return (
    <div className="panel-card viewer-controls">
      <div className="panel-card__header">
        <h3>{t("viewer.controls")}</h3>
      </div>
      <div className="viewer-controls__row">
        <button type="button" onClick={() => onCameraPreset("front")}>
          {t("toolbar.front")}
        </button>
        <button type="button" onClick={() => onCameraPreset("back")}>
          {t("toolbar.back")}
        </button>
        <button type="button" onClick={() => onCameraPreset("left")}>
          {t("toolbar.left")}
        </button>
        <button type="button" onClick={() => onCameraPreset("right")}>
          {t("toolbar.right")}
        </button>
        <button type="button" onClick={() => onCameraPreset("perspective")}>
          {t("toolbar.perspective")}
        </button>
      </div>
      <div className="viewer-controls__row viewer-controls__row--fields">
        <label>
          {t("toolbar.viewport")}
          <input
            type="color"
            value={backgroundColor}
            onChange={(event) => onBackgroundColor(event.target.value)}
          />
        </label>
        <label>
          {t("toolbar.shirt")}
          <input
            type="color"
            value={shirtBaseColor}
            onChange={(event) => onShirtBaseColor(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={onToggleWireframe}
          className={wireframe ? "is-active" : ""}
        >
          {t("toolbar.wireframe")}
        </button>
      </div>
    </div>
  );
};
