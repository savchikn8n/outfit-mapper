import { UiLanguage } from "../types/app";
import { useI18n } from "../app/i18n";

interface ToolbarProps {
  language: UiLanguage;
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onImportPng: () => void;
  onImportSvg: () => void;
  onExportViewer: () => void;
  onExportLayout: () => void;
  onExportProject: () => void;
  onLanguageChange: (language: UiLanguage) => void;
}

export const Toolbar = ({
  language,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onImportPng,
  onImportSvg,
  onExportViewer,
  onExportLayout,
  onExportProject,
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
    <div className="toolbar__group toolbar__group--controls">
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
