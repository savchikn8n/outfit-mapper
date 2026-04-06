import { useI18n } from "../app/i18n";

interface StatusBarProps {
  message: string;
  layerCount: number;
  selectedLayerName: string;
}

export const StatusBar = ({
  message,
  layerCount,
  selectedLayerName
}: StatusBarProps) => {
  const { t } = useI18n();

  return (
    <footer className="status-bar">
      <span>{message}</span>
      <span>
        {layerCount} {t("status.layers")}
      </span>
      <span>{selectedLayerName || t("status.noLayerSelected")}</span>
    </footer>
  );
};
