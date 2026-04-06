interface StatusBarProps {
  message: string;
  layerCount: number;
  selectedLayerName: string;
}

export const StatusBar = ({
  message,
  layerCount,
  selectedLayerName
}: StatusBarProps) => (
  <footer className="status-bar">
    <span>{message}</span>
    <span>{layerCount} layer(s)</span>
    <span>{selectedLayerName || "No layer selected"}</span>
  </footer>
);
