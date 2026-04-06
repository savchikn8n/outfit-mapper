import { ChangeEvent } from "react";
import { ArtworkLayer, TargetRegion } from "../../../types/app";
import { useI18n } from "../../../app/i18n";

interface InspectorPanelProps {
  layer: ArtworkLayer | null;
  onChangeLayer: (id: string, patch: Partial<ArtworkLayer>) => void;
  onDeleteLayer: () => void;
  onDuplicateLayer: () => void;
}

const regions: TargetRegion[] = ["front", "back", "leftSleeve", "rightSleeve"];

export const InspectorPanel = ({
  layer,
  onChangeLayer,
  onDeleteLayer,
  onDuplicateLayer
}: InspectorPanelProps) => {
  const { getRegionLabel, t } = useI18n();

  if (!layer) {
    return (
      <div className="panel-card">
        <div className="panel-card__header">
          <h3>{t("inspector.title")}</h3>
        </div>
        <p className="empty-state">{t("inspector.empty")}</p>
      </div>
    );
  }

  const onFieldChange =
    (field: keyof ArtworkLayer) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      const numericFields = new Set<keyof ArtworkLayer>([
        "x",
        "y",
        "width",
        "height",
        "rotation",
        "opacity"
      ]);

      onChangeLayer(layer.id, {
        [field]: numericFields.has(field) ? Number(value) : value
      } as Partial<ArtworkLayer>);
    };

  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <h3>{t("inspector.title")}</h3>
        <span>{layer.name}</span>
      </div>
      <div className="inspector-grid">
        <label>
          X
          <input type="number" value={Math.round(layer.x)} onChange={onFieldChange("x")} />
        </label>
        <label>
          Y
          <input type="number" value={Math.round(layer.y)} onChange={onFieldChange("y")} />
        </label>
        <label>
          {t("inspector.width")}
          <input type="number" value={Math.round(layer.width)} onChange={onFieldChange("width")} />
        </label>
        <label>
          {t("inspector.height")}
          <input type="number" value={Math.round(layer.height)} onChange={onFieldChange("height")} />
        </label>
        <label>
          {t("inspector.rotation")}
          <input type="number" value={Math.round(layer.rotation)} onChange={onFieldChange("rotation")} />
        </label>
        <label>
          {t("inspector.opacity")}
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={layer.opacity}
            onChange={onFieldChange("opacity")}
          />
        </label>
        <label className="field-span">
          {t("inspector.targetRegion")}
          <select value={layer.targetRegion} onChange={onFieldChange("targetRegion")}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {getRegionLabel(region)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="button-row">
        <button type="button" onClick={onDuplicateLayer}>
          {t("inspector.duplicate")}
        </button>
        <button type="button" onClick={onDeleteLayer}>
          {t("inspector.delete")}
        </button>
      </div>
    </div>
  );
};
