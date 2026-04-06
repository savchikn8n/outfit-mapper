import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { I18nProvider, useI18n } from "./i18n";
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
import { ViewerControls } from "../features/viewer3d/components/ViewerControls";
import { useProjectStore } from "../store/projectStore";
import { TargetRegion } from "../types/app";
import { fitImageToBounds, loadImageElement, readFileAsDataUrl } from "../utils/image";

type EditorRegion = TargetRegion | "all";

const AppContent = () => {
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
    setAvatarGender,
    setLanguage,
    setBackgroundColor,
    setShirtBaseColor,
    toggleWireframe,
    setCameraPreset,
    newProject,
    loadProject,
    setStatusMessage
  } = useProjectStore();
  const { formatStatus, t } = useI18n();

  const stageRef = useRef<Konva.Stage | null>(null);
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [accept, setAccept] = useState(".png,.jpg,.jpeg,.svg");
  const [activeRegion, setActiveRegion] = useState<EditorRegion>("front");

  const visibleEditorLayers = useMemo(
    () =>
      activeRegion === "all"
        ? project.artworkLayers
        : project.artworkLayers.filter((layer) => layer.targetRegion === activeRegion),
    [activeRegion, project.artworkLayers]
  );

  const selectedLayer = useMemo(
    () => visibleEditorLayers.find((layer) => layer.id === selectedLayerId) ?? null,
    [visibleEditorLayers, selectedLayerId]
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
    let fittedSize: { width: number; height: number } | undefined;
    try {
      const image = await loadImageElement(source);
      fittedSize = fitImageToBounds(image.naturalWidth, image.naturalHeight, 240, 300);
    } catch {
      fittedSize = undefined;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    importArtwork({
      source,
      name: file.name,
      type: extension === "svg" ? "svg" : "png",
      targetRegion: activeRegion === "all" ? "front" : activeRegion,
      width: fittedSize?.width,
      height: fittedSize?.height
    });

    if (activeRegion === "front" || activeRegion === "back") {
      setCameraPreset(activeRegion);
    }

    event.target.value = "";
  };

  const exportLayout = () => {
    const exported =
      exportStageAsPng("layout-export.png", stageRef.current) ||
      exportCanvasAsPng("layout-export.png", textureCanvas);
    if (exported) {
      setStatusMessage({ key: "layoutExported" });
    }
  };

  const exportViewer = () => {
    if (exportCanvasAsPng("viewer-export.png", viewerCanvasRef.current)) {
      setStatusMessage({ key: "previewExported" });
    }
  };

  const exportProject = () => {
    downloadProjectJson(project);
    setStatusMessage({ key: "projectExported" });
  };

  const saveProject = () => {
    downloadProjectJson(project);
    setStatusMessage({ key: "projectSaved" });
  };

  const openProject = async () => {
    const nextProject = await openProjectFile();
    if (!nextProject) {
      setStatusMessage({ key: "projectOpenFailed" });
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
    void persistProjectLocally(project);
  }, [project]);

  return (
    <div className="app-shell">
      <Toolbar
        language={project.sceneSettings.language}
        onNewProject={onNewProject}
        onOpenProject={openProject}
        onSaveProject={saveProject}
        onImportPng={() => triggerImport(".png,.jpg,.jpeg")}
        onImportSvg={() => triggerImport(".svg")}
        onExportViewer={exportViewer}
        onExportLayout={exportLayout}
        onExportProject={exportProject}
        onLanguageChange={setLanguage}
      />

      <main className="workspace">
        <section className="viewer-column">
          <div className="section-title">
            <h2>{t("viewer.title")}</h2>
            <span>
              {t("viewer.liveTextureRevision")} {textureReadyRevision}
            </span>
          </div>
          <ViewerPanel
            artworkLayers={project.artworkLayers}
            textureRevision={textureRevision}
            shirtBaseColor={project.sceneSettings.shirtBaseColor}
            backgroundColor={project.sceneSettings.backgroundColor}
            wireframe={project.sceneSettings.wireframe}
            mannequinPreset={project.sceneSettings.mannequinPreset}
            avatarGender={project.sceneSettings.avatarGender}
            cameraPreset={project.sceneSettings.cameraPreset}
            onViewportReady={onViewportReady}
          />
          <ViewerControls
            backgroundColor={project.sceneSettings.backgroundColor}
            shirtBaseColor={project.sceneSettings.shirtBaseColor}
            wireframe={project.sceneSettings.wireframe}
            onCameraPreset={setCameraPreset}
            onBackgroundColor={setBackgroundColor}
            onShirtBaseColor={setShirtBaseColor}
            onToggleWireframe={toggleWireframe}
          />
          <AvatarPanel
            selectedPreset={project.sceneSettings.mannequinPreset}
            selectedGender={project.sceneSettings.avatarGender}
            onSelectPreset={setMannequinPreset}
            onSelectGender={setAvatarGender}
          />
        </section>

        <section className="editor-column">
          <div className="section-title">
            <h2>{t("editor.title")}</h2>
            <span>{t("editor.subtitle")}</span>
          </div>
          <div className="editor-region-bar panel-card">
            <label>
              {t("editor.region")}
              <select
                value={activeRegion}
                onChange={(event) => {
                  setActiveRegion(event.target.value as EditorRegion);
                  selectLayer(null);
                }}
              >
                <option value="front">{t("region.front")}</option>
                <option value="back">{t("region.back")}</option>
                <option value="leftSleeve">{t("region.leftSleeve")}</option>
                <option value="rightSleeve">{t("region.rightSleeve")}</option>
                <option value="all">{t("editor.allRegions")}</option>
              </select>
            </label>
          </div>
          <div className="editor-grid">
            <div className="editor-grid__canvas">
              <LayoutEditor
                layers={visibleEditorLayers}
                activeRegion={activeRegion}
                selectedLayerId={selectedLayerId}
                onSelectLayer={selectLayer}
                onChangeLayer={updateLayer}
                onStageReady={(stage) => {
                  stageRef.current = stage;
                }}
              />
            </div>
            <div className="editor-stack">
              <LayerList
                layers={visibleEditorLayers}
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
        message={formatStatus(statusMessage)}
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

export const App = () => {
  const language = useProjectStore((state) => state.project.sceneSettings.language);

  return (
    <I18nProvider language={language}>
      <AppContent />
    </I18nProvider>
  );
};
