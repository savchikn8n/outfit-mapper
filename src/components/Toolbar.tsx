import { CameraPreset, UiLanguage } from "../types/app";
import { useI18n } from "../app/i18n";

interface ToolbarProps {
  language: UiLanguage;
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
  onLanguageChange: (language: UiLanguage) => void;
}

export const Toolbar = ({
  language,
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
  onToggleWireframe,
  onLanguageChange
}: ToolbarProps) => {
  const { t } = useI18n();

  return (
    <header className="toolbar">
    <div className="toolbar__group">
      <button type="button" onClick={onNewProject}>
        {t("toolbar.new")}
      </button>
      <button type="button" onClick={onOpenProject}>
        {t("toolbar.open")}
      </button>
      <button type="button" onClick={onSaveProject}>
        {t("toolbar.save")}
      </button>
    </div>

    <div className="toolbar__group">
      <button type="button" onClick={onImportPng}>
        {t("toolbar.importPng")}
      </button>
      <button type="button" onClick={onImportSvg}>
        {t("toolbar.importSvg")}
      </button>
    </div>

    <div className="toolbar__group">
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

    <div className="toolbar__group toolbar__group--controls">
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
      <button type="button" onClick={onToggleWireframe} className={wireframe ? "is-active" : ""}>
        {t("toolbar.wireframe")}
      </button>
      <label>
        {t("toolbar.language")}
        <select value={language} onChange={(event) => onLanguageChange(event.target.value as UiLanguage)}>
          <option value="ru">{t("language.russian")}</option>
          <option value="en">{t("language.english")}</option>
        </select>
      </label>
    </div>

    <div className="toolbar__group">
      <button type="button" onClick={onExportViewer}>
        {t("toolbar.export3d")}
      </button>
      <button type="button" onClick={onExportLayout}>
        {t("toolbar.exportLayout")}
      </button>
      <button type="button" onClick={onExportProject}>
        {t("toolbar.exportJson")}
      </button>
    </div>
    </header>
  );
};
