import { ProjectData } from "../../types/app";
import { downloadJson } from "../../utils/download";

const LAST_PROJECT_KEY = "outfit-mapper:last-project";

export const loadLastProject = (): ProjectData | null => {
  const savedProject = localStorage.getItem(LAST_PROJECT_KEY);
  if (!savedProject) {
    return null;
  }

  try {
    return JSON.parse(savedProject) as ProjectData;
  } catch {
    localStorage.removeItem(LAST_PROJECT_KEY);
    return null;
  }
};

export const persistProjectLocally = (project: ProjectData) => {
  localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(project));
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
        resolve(JSON.parse(text) as ProjectData);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
