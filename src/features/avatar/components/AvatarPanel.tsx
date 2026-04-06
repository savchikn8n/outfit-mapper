import { avatarPresets } from "../presets";
import { MannequinPresetId } from "../../../types/app";

interface AvatarPanelProps {
  selectedPreset: MannequinPresetId;
  onSelectPreset: (preset: MannequinPresetId) => void;
}

export const AvatarPanel = ({ selectedPreset, onSelectPreset }: AvatarPanelProps) => (
  <div className="panel-card">
    <div className="panel-card__header">
      <h3>Avatar</h3>
      <span>MVP presets</span>
    </div>
    <div className="preset-list">
      {avatarPresets.map((preset) => (
        <button
          type="button"
          key={preset.id}
          className={`preset-card ${selectedPreset === preset.id ? "is-selected" : ""}`}
          onClick={() => onSelectPreset(preset.id)}
        >
          <strong>{preset.label}</strong>
          <span>{preset.description}</span>
        </button>
      ))}
    </div>
    <div className="coming-soon">
      <strong>Generate avatar from photos</strong>
      <span>Coming later. The architecture placeholder is ready for a future module.</span>
    </div>
  </div>
);
