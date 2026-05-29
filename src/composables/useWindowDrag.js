import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowDrag() {
  async function startWindowDrag(event) {
    if (event.button !== 0) {
      return;
    }

    try {
      await getCurrentWindow().startDragging();
    } catch {
      // Ignore when not running inside a Tauri window.
    }
  }

  return { startWindowDrag };
}
