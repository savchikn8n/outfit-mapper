import { ProjectData } from "../../types/app";
import { downloadJson } from "../../utils/download";
import { normalizeProjectData } from "./normalizeProject";

const LAST_PROJECT_KEY = "outfit-mapper:last-project";

export const loadLastProject = (): ProjectData | null => {
  try {
    const savedProject = localStorage.getItem(LAST_PROJECT_KEY);
    if (!savedProject) {
      return null;
    }

    return normalizeProjectData(JSON.parse(savedProject));
  } catch {
    localStorage.removeItem(LAST_PROJECT_KEY);
    return null;
  }
};

export const persistProjectLocally = (project: ProjectData) => {
  try {
    localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(project));
    return true;
  } catch {
    return false;
  }
};

export const clearPersistedProject = () => {
  localStorage.removeItem(LAST_PROJECT_KEY);
};

export const downloadProjectJson = (project: ProjectData) => {
  persistProjectLocally(project);
  downloadJson("outfit-project.json", project);
};

export const openProjectFile = async () =>
  new Promise<ProjectData | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        resolve(normalizeProjectData(JSON.parse(text)));
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
