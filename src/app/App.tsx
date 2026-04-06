import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { AvatarPanel } from "../features/avatar/components/AvatarPanel";
import { exportCanvasAsPng, exportStageAsPng } from "../features/export/exporters";
import { InspectorPanel } from "../features/layout2d/components/InspectorPanel";
import { LayerList } from "../features/layout2d/components/LayerList";
import { LayoutEditor } from "../features/layout2d/components/LayoutEditor";
import { useTextureComposer } from "../features/layout2d/hooks/useTextureComposer";
import {
  clearPersistedProject,
  downloadProjectJson,
  loadLastProject,
  openProjectFile,
  persistProjectLocally
} from "../features/projects/persistence";
import { ViewerPanel } from "../features/viewer3d/components/ViewerPanel";
import { useProjectStore } from "../store/projectStore";
import { readFileAsDataUrl } from "../utils/image";

export const App = () => {
  const {
    project,
    selectedLayerId,
    textureRevision,
    statusMessage,
    importArtwork,
    selectLayer,
    updateLayer,
    deleteSelectedLayer,
    duplicateSelectedLayer,
    reorderLayer,
    setLayerVisibility,
    toggleLayerLock,
    setMannequinPreset,
    setBackgroundColor,
    setShirtBaseColor,
    toggleWireframe,
    setCameraPreset,
    newProject,
    loadProject,
    setStatusMessage
  } = useProjectStore();

  const stageRef = useRef<Konva.Stage | null>(null);
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [accept, setAccept] = useState(".png,.jpg,.jpeg,.svg");

  const selectedLayer = useMemo(
    () => project.artworkLayers.find((layer) => layer.id === selectedLayerId) ?? null,
    [project.artworkLayers, selectedLayerId]
  );

  const { textureCanvas, textureReadyRevision } = useTextureComposer(
    project.artworkLayers,
    project.sceneSettings.shirtBaseColor,
    textureRevision
  );

  const triggerImport = (types: string) => {
    setAccept(types);
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const savedProject = loadLastProject();
    if (!savedProject) {
      return;
    }
    loadProject(savedProject);
  }, [loadProject]);

  const onImportFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const source = await readFileAsDataUrl(file);
    const extension = file.name.split(".").pop()?.toLowerCase();
    importArtwork({
      source,
      name: file.name,
      type: extension === "svg" ? "svg" : "png"
    });

    event.target.value = "";
  };

  const exportLayout = () => {
    const exported =
      exportStageAsPng("layout-export.png", stageRef.current) ||
      exportCanvasAsPng("layout-export.png", textureCanvas);
    if (exported) {
      setStatusMessage("Layout exported");
    }
  };

  const exportViewer = () => {
    if (exportCanvasAsPng("viewer-export.png", viewerCanvasRef.current)) {
      setStatusMessage("3D preview exported");
    }
  };

  const exportProject = () => {
    downloadProjectJson(project);
    setStatusMessage("Project JSON exported");
  };

  const saveProject = () => {
    downloadProjectJson(project);
    setStatusMessage("Project saved locally and exported");
  };

  const openProject = async () => {
    const nextProject = await openProjectFile();
    if (!nextProject) {
      setStatusMessage("Project open cancelled or invalid");
      return;
    }
    loadProject(nextProject);
  };

  const onNewProject = () => {
    newProject();
    clearPersistedProject();
  };

  const onViewportReady = (canvas: HTMLCanvasElement) => {
    viewerCanvasRef.current = canvas;
  };

  useEffect(() => {
    persistProjectLocally(project);
  }, [project]);

  return (
    <div className="app-shell">
      <Toolbar
        mannequinPreset={project.sceneSettings.mannequinPreset}
        backgroundColor={project.sceneSettings.backgroundColor}
        shirtBaseColor={project.sceneSettings.shirtBaseColor}
        wireframe={project.sceneSettings.wireframe}
        onNewProject={onNewProject}
        onOpenProject={openProject}
        onSaveProject={saveProject}
        onImportPng={() => triggerImport(".png,.jpg,.jpeg")}
        onImportSvg={() => triggerImport(".svg")}
        onExportViewer={exportViewer}
        onExportLayout={exportLayout}
        onExportProject={exportProject}
        onCameraPreset={setCameraPreset}
        onBackgroundColor={setBackgroundColor}
        onShirtBaseColor={setShirtBaseColor}
        onToggleWireframe={toggleWireframe}
      />

      <main className="workspace">
        <section className="viewer-column">
          <div className="section-title">
            <h2>3D Preview</h2>
            <span>Live texture revision {textureReadyRevision}</span>
          </div>
          <ViewerPanel
            textureCanvas={textureCanvas}
            textureRevision={textureReadyRevision}
            shirtBaseColor={project.sceneSettings.shirtBaseColor}
            backgroundColor={project.sceneSettings.backgroundColor}
            wireframe={project.sceneSettings.wireframe}
            mannequinPreset={project.sceneSettings.mannequinPreset}
            cameraPreset={project.sceneSettings.cameraPreset}
            onViewportReady={onViewportReady}
          />
          <AvatarPanel
            selectedPreset={project.sceneSettings.mannequinPreset}
            onSelectPreset={setMannequinPreset}
          />
        </section>

        <section className="editor-column">
          <div className="section-title">
            <h2>2D UV Layout</h2>
            <span>Front, back, and sleeve regions</span>
          </div>
          <div className="editor-grid">
            <div className="editor-grid__canvas">
              <LayoutEditor
                layers={project.artworkLayers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={selectLayer}
                onChangeLayer={updateLayer}
                onStageReady={(stage) => {
                  stageRef.current = stage;
                }}
              />
            </div>
            <div className="editor-grid__sidebar">
              <LayerList
                layers={project.artworkLayers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={selectLayer}
                onToggleVisibility={setLayerVisibility}
                onToggleLock={toggleLayerLock}
                onReorderLayer={reorderLayer}
              />
              <InspectorPanel
                layer={selectedLayer}
                onChangeLayer={updateLayer}
                onDeleteLayer={deleteSelectedLayer}
                onDuplicateLayer={duplicateSelectedLayer}
              />
            </div>
          </div>
        </section>
      </main>

      <StatusBar
        message={statusMessage}
        layerCount={project.artworkLayers.length}
        selectedLayerName={selectedLayer?.name ?? ""}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(event) => {
          void onImportFiles(event);
        }}
      />
    </div>
  );
};
