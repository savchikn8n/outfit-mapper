import { avatarPresets } from "../presets";
import { AvatarGender, MannequinPresetId } from "../../../types/app";
import { useI18n } from "../../../app/i18n";

interface AvatarPanelProps {
  selectedPreset: MannequinPresetId;
  selectedGender: AvatarGender;
  onSelectPreset: (preset: MannequinPresetId) => void;
  onSelectGender: (gender: AvatarGender) => void;
}

export const AvatarPanel = ({
  selectedPreset,
  selectedGender,
  onSelectPreset,
  onSelectGender
}: AvatarPanelProps) => {
  const { getPresetDescription, getPresetLabel, t } = useI18n();

  return (
    <div className="panel-card">
    <div className="panel-card__header">
      <h3>{t("avatar.title")}</h3>
      <span>{t("avatar.presets")}</span>
    </div>
    <div className="button-segment">
      <span className="panel-label">{t("avatar.gender")}</span>
      <div className="button-row">
        <button
          type="button"
          className={selectedGender === "male" ? "is-active" : ""}
          onClick={() => onSelectGender("male")}
        >
          {t("avatar.male")}
        </button>
        <button
          type="button"
          className={selectedGender === "female" ? "is-active" : ""}
          onClick={() => onSelectGender("female")}
        >
          {t("avatar.female")}
        </button>
      </div>
    </div>
    <div className="preset-list">
      {avatarPresets.map((preset) => (
        <button
          type="button"
          key={preset.id}
          className={`preset-card ${selectedPreset === preset.id ? "is-selected" : ""}`}
          onClick={() => onSelectPreset(preset.id)}
        >
          <strong>{getPresetLabel(preset.id)}</strong>
          <span>{getPresetDescription(preset.id)}</span>
        </button>
      ))}
    </div>
    <div className="coming-soon">
      <strong>{t("avatar.comingSoonTitle")}</strong>
      <span>{t("avatar.comingSoonText")}</span>
    </div>
    </div>
  );
};
