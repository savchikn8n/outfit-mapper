import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  AvatarGender,
  MannequinPresetId,
  StatusMessage,
  TargetRegion,
  UiLanguage
} from "../types/app";

type TranslationKey =
  | "toolbar.new"
  | "toolbar.open"
  | "toolbar.save"
  | "toolbar.importPng"
  | "toolbar.importSvg"
  | "toolbar.front"
  | "toolbar.back"
  | "toolbar.left"
  | "toolbar.right"
  | "toolbar.perspective"
  | "toolbar.viewport"
  | "toolbar.shirt"
  | "toolbar.wireframe"
  | "toolbar.export3d"
  | "toolbar.exportLayout"
  | "toolbar.exportJson"
  | "toolbar.language"
  | "language.english"
  | "language.russian"
  | "viewer.title"
  | "viewer.controls"
  | "viewer.loadingModel"
  | "viewer.liveTextureRevision"
  | "viewer.placeholderNote"
  | "editor.title"
  | "editor.region"
  | "editor.subtitle"
  | "editor.allRegions"
  | "avatar.title"
  | "avatar.presets"
  | "avatar.gender"
  | "avatar.male"
  | "avatar.female"
  | "avatar.comingSoonTitle"
  | "avatar.comingSoonText"
  | "preset.slim.title"
  | "preset.slim.description"
  | "preset.regular.title"
  | "preset.regular.description"
  | "preset.oversized.title"
  | "preset.oversized.description"
  | "preset.neutral.title"
  | "preset.neutral.description"
  | "layers.title"
  | "layer.hide"
  | "layer.show"
  | "layer.lock"
  | "layer.unlock"
  | "layer.up"
  | "layer.down"
  | "inspector.title"
  | "inspector.empty"
  | "inspector.width"
  | "inspector.height"
  | "inspector.rotation"
  | "inspector.opacity"
  | "inspector.targetRegion"
  | "inspector.duplicate"
  | "inspector.delete"
  | "status.layers"
  | "status.noLayerSelected"
  | "status.ready"
  | "status.imported"
  | "status.layerRemoved"
  | "status.layerDuplicated"
  | "status.presetChanged"
  | "status.genderChanged"
  | "status.layoutExported"
  | "status.previewExported"
  | "status.projectExported"
  | "status.projectSaved"
  | "status.projectOpenFailed"
  | "status.newProject"
  | "status.projectLoaded"
  | "region.front"
  | "region.back"
  | "region.leftSleeve"
  | "region.rightSleeve";

const translations: Record<UiLanguage, Record<TranslationKey, string>> = {
  en: {
    "toolbar.new": "New",
    "toolbar.open": "Open",
    "toolbar.save": "Save",
    "toolbar.importPng": "Import PNG",
    "toolbar.importSvg": "Import SVG",
    "toolbar.front": "Front",
    "toolbar.back": "Back",
    "toolbar.left": "Left",
    "toolbar.right": "Right",
    "toolbar.perspective": "Perspective",
    "toolbar.viewport": "Viewport",
    "toolbar.shirt": "Shirt",
    "toolbar.wireframe": "UV / Wireframe",
    "toolbar.export3d": "Export 3D PNG",
    "toolbar.exportLayout": "Export Layout PNG",
    "toolbar.exportJson": "Export JSON",
    "toolbar.language": "Language",
    "language.english": "English",
    "language.russian": "Russian",
    "viewer.title": "3D Preview",
    "viewer.controls": "Viewer controls",
    "viewer.loadingModel": "Loading model",
    "viewer.liveTextureRevision": "Live texture revision",
    "viewer.placeholderNote":
      "A standalone shirt GLB preview is active. The 2D layout now updates the shirt material directly for a simpler MVP workflow.",
    "editor.title": "2D UV Layout",
    "editor.region": "Area",
    "editor.subtitle": "Front, back, and sleeve regions",
    "editor.allRegions": "All regions",
    "avatar.title": "Avatar",
    "avatar.presets": "Fit presets",
    "avatar.gender": "Gender",
    "avatar.male": "Male",
    "avatar.female": "Female",
    "avatar.comingSoonTitle": "Generate avatar from photos",
    "avatar.comingSoonText": "Coming later. The architecture placeholder is ready for a future module.",
    "preset.slim.title": "Slim",
    "preset.slim.description": "Narrow torso with a close-fitting shirt profile.",
    "preset.regular.title": "Regular",
    "preset.regular.description": "Balanced default fit for previewing standard apparel.",
    "preset.oversized.title": "Oversized",
    "preset.oversized.description": "Broader shoulder and relaxed shirt silhouette.",
    "preset.neutral.title": "Neutral",
    "preset.neutral.description": "Balanced presentation with softened proportions.",
    "layers.title": "Layers",
    "layer.hide": "Hide",
    "layer.show": "Show",
    "layer.lock": "Lock",
    "layer.unlock": "Unlock",
    "layer.up": "Up",
    "layer.down": "Down",
    "inspector.title": "Inspector",
    "inspector.empty": "Select an artwork layer to edit its transform and placement.",
    "inspector.width": "Width",
    "inspector.height": "Height",
    "inspector.rotation": "Rotation",
    "inspector.opacity": "Opacity",
    "inspector.targetRegion": "Target region",
    "inspector.duplicate": "Duplicate",
    "inspector.delete": "Delete",
    "status.layers": "layer(s)",
    "status.noLayerSelected": "No layer selected",
    "status.ready": "Ready",
    "status.imported": "Imported {value}",
    "status.layerRemoved": "Layer removed",
    "status.layerDuplicated": "Layer duplicated",
    "status.presetChanged": "Preset changed: {value}",
    "status.genderChanged": "Gender changed: {value}",
    "status.layoutExported": "Layout exported",
    "status.previewExported": "3D preview exported",
    "status.projectExported": "Project JSON exported",
    "status.projectSaved": "Project saved locally and exported",
    "status.projectOpenFailed": "Project open cancelled or invalid",
    "status.newProject": "New project",
    "status.projectLoaded": "Loaded {value}",
    "region.front": "Front",
    "region.back": "Back",
    "region.leftSleeve": "Left Sleeve",
    "region.rightSleeve": "Right Sleeve"
  },
  ru: {
    "toolbar.new": "Новый",
    "toolbar.open": "Открыть",
    "toolbar.save": "Сохранить",
    "toolbar.importPng": "Импорт PNG",
    "toolbar.importSvg": "Импорт SVG",
    "toolbar.front": "Спереди",
    "toolbar.back": "Сзади",
    "toolbar.left": "Слева",
    "toolbar.right": "Справа",
    "toolbar.perspective": "Перспектива",
    "toolbar.viewport": "Фон",
    "toolbar.shirt": "Футболка",
    "toolbar.wireframe": "UV / Каркас",
    "toolbar.export3d": "Экспорт 3D PNG",
    "toolbar.exportLayout": "Экспорт макета PNG",
    "toolbar.exportJson": "Экспорт JSON",
    "toolbar.language": "Язык",
    "language.english": "English",
    "language.russian": "Русский",
    "viewer.title": "3D-превью",
    "viewer.controls": "Управление превью",
    "viewer.loadingModel": "Загрузка модели",
    "viewer.liveTextureRevision": "Версия live-текстуры",
    "viewer.placeholderNote":
      "Сейчас активен standalone GLB футболки. 2D-макет теперь напрямую обновляет материал футболки для более простого MVP-сценария.",
    "editor.title": "2D UV-макет",
    "editor.region": "Область",
    "editor.subtitle": "Перед, спина и зоны рукавов",
    "editor.allRegions": "Все области",
    "avatar.title": "Аватар",
    "avatar.presets": "Посадка",
    "avatar.gender": "Пол",
    "avatar.male": "Мужской",
    "avatar.female": "Женский",
    "avatar.comingSoonTitle": "Генерация аватара по фото",
    "avatar.comingSoonText": "Позже. Архитектурная заготовка уже предусмотрена под будущий модуль.",
    "preset.slim.title": "Приталенный",
    "preset.slim.description": "Узкий торс и более прилегающий силуэт футболки.",
    "preset.regular.title": "Стандартный",
    "preset.regular.description": "Сбалансированная посадка для базового предпросмотра.",
    "preset.oversized.title": "Оверсайз",
    "preset.oversized.description": "Шире плечи и более свободный силуэт футболки.",
    "preset.neutral.title": "Нейтральный",
    "preset.neutral.description": "Сдержанные универсальные пропорции без явного акцента.",
    "layers.title": "Слои",
    "layer.hide": "Скрыть",
    "layer.show": "Показать",
    "layer.lock": "Блок",
    "layer.unlock": "Разблок",
    "layer.up": "Вверх",
    "layer.down": "Вниз",
    "inspector.title": "Инспектор",
    "inspector.empty": "Выберите слой, чтобы редактировать его трансформацию и размещение.",
    "inspector.width": "Ширина",
    "inspector.height": "Высота",
    "inspector.rotation": "Поворот",
    "inspector.opacity": "Прозрачность",
    "inspector.targetRegion": "Область размещения",
    "inspector.duplicate": "Дублировать",
    "inspector.delete": "Удалить",
    "status.layers": "слоёв",
    "status.noLayerSelected": "Слой не выбран",
    "status.ready": "Готово",
    "status.imported": "Импортирован {value}",
    "status.layerRemoved": "Слой удален",
    "status.layerDuplicated": "Слой дублирован",
    "status.presetChanged": "Выбран пресет: {value}",
    "status.genderChanged": "Выбран пол: {value}",
    "status.layoutExported": "Макет экспортирован",
    "status.previewExported": "3D-превью экспортировано",
    "status.projectExported": "JSON проекта экспортирован",
    "status.projectSaved": "Проект сохранен локально и экспортирован",
    "status.projectOpenFailed": "Открытие проекта отменено или файл некорректен",
    "status.newProject": "Новый проект",
    "status.projectLoaded": "Загружен проект: {value}",
    "region.front": "Перед",
    "region.back": "Спина",
    "region.leftSleeve": "Левый рукав",
    "region.rightSleeve": "Правый рукав"
  }
};

interface I18nContextValue {
  language: UiLanguage;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  getRegionLabel: (region: TargetRegion) => string;
  getPresetLabel: (preset: MannequinPresetId) => string;
  getPresetDescription: (preset: MannequinPresetId) => string;
  getGenderLabel: (gender: AvatarGender) => string;
  formatStatus: (message: StatusMessage) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (template: string, params?: Record<string, string>) => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    template
  );
};

export const I18nProvider = ({
  language,
  children
}: {
  language: UiLanguage;
  children: ReactNode;
}) => {
  const value = useMemo<I18nContextValue>(() => {
    const t = (key: TranslationKey, params?: Record<string, string>) =>
      interpolate(translations[language][key], params);

    const getRegionLabel = (region: TargetRegion) =>
      t(`region.${region}` as TranslationKey);

    const getPresetLabel = (preset: MannequinPresetId) =>
      t(`preset.${preset}.title` as TranslationKey);

    const getPresetDescription = (preset: MannequinPresetId) =>
      t(`preset.${preset}.description` as TranslationKey);

    const getGenderLabel = (gender: AvatarGender) =>
      gender === "female" ? t("avatar.female") : t("avatar.male");

    const formatStatus = (message: StatusMessage) => {
      const statusKey = `status.${message.key}` as TranslationKey;
      let translatedValue = message.value;

      if (message.key === "presetChanged" && message.value) {
        translatedValue = getPresetLabel(message.value as MannequinPresetId);
      }

      if (message.key === "genderChanged" && message.value) {
        translatedValue = getGenderLabel(message.value as AvatarGender);
      }

      return t(statusKey, translatedValue ? { value: translatedValue } : undefined);
    };

    return {
      language,
      t,
      getRegionLabel,
      getPresetLabel,
      getPresetDescription,
      getGenderLabel,
      formatStatus
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
