import { ArtworkLayer } from "../../../types/app";
import { useI18n } from "../../../app/i18n";

interface LayerListProps {
  layers: ArtworkLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleLock: (id: string) => void;
  onReorderLayer: (id: string, direction: "up" | "down") => void;
}

export const LayerList = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayer
}: LayerListProps) => {
  const { getRegionLabel, t } = useI18n();

  return (
    <div className="panel-card">
    <div className="panel-card__header">
      <h3>{t("layers.title")}</h3>
      <span>{layers.length}</span>
    </div>
    <div className="layer-list">
      {[...layers]
        .sort((left, right) => right.zIndex - left.zIndex)
        .map((layer) => (
          <button
            type="button"
            key={layer.id}
            className={`layer-row ${selectedLayerId === layer.id ? "is-selected" : ""}`}
            onClick={() => onSelectLayer(layer.id)}
          >
            <div>
              <strong>{layer.name}</strong>
              <span>{getRegionLabel(layer.targetRegion)}</span>
            </div>
            <div className="layer-row__actions">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleVisibility(layer.id, !layer.visible);
                }}
              >
                {layer.visible ? t("layer.hide") : t("layer.show")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleLock(layer.id);
                }}
              >
                {layer.locked ? t("layer.unlock") : t("layer.lock")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReorderLayer(layer.id, "up");
                }}
              >
                {t("layer.up")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReorderLayer(layer.id, "down");
                }}
              >
                {t("layer.down")}
              </button>
            </div>
          </button>
        ))}
    </div>
    </div>
  );
};
