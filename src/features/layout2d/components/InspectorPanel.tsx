import { ChangeEvent } from "react";
import { ArtworkLayer, TargetRegion } from "../../../types/app";

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
  if (!layer) {
    return (
      <div className="panel-card">
        <div className="panel-card__header">
          <h3>Inspector</h3>
        </div>
        <p className="empty-state">Select an artwork layer to edit its transform and placement.</p>
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
        <h3>Inspector</h3>
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
          Width
          <input type="number" value={Math.round(layer.width)} onChange={onFieldChange("width")} />
        </label>
        <label>
          Height
          <input type="number" value={Math.round(layer.height)} onChange={onFieldChange("height")} />
        </label>
        <label>
          Rotation
          <input type="number" value={Math.round(layer.rotation)} onChange={onFieldChange("rotation")} />
        </label>
        <label>
          Opacity
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
          Target region
          <select value={layer.targetRegion} onChange={onFieldChange("targetRegion")}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="button-row">
        <button type="button" onClick={onDuplicateLayer}>
          Duplicate
        </button>
        <button type="button" onClick={onDeleteLayer}>
          Delete
        </button>
      </div>
    </div>
  );
};
