import { useEffect, useReducer, useState } from "react";
import {
  migrateStyle,
  STYLE_STORAGE_KEY,
  styleHistoryReducer,
} from "../lib/style";
import type { StyleSettings } from "../types/style";

export function useStyleSettings() {
  const [history, dispatch] = useReducer(styleHistoryReducer, undefined, () => {
    let settings: StyleSettings;
    try {
      const raw = localStorage.getItem(STYLE_STORAGE_KEY);
      settings = migrateStyle(
        raw ? JSON.parse(raw) : null,
        localStorage.getItem("courseScheduler.cardBackgroundPreset"),
      );
    } catch {
      settings = migrateStyle(null, null);
    }
    return { past: [], present: settings, future: [] };
  });
  const [saveState, setSaveState] = useState<"saved" | "unavailable">("saved");
  useEffect(() => {
    try {
      localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(history.present));
      setSaveState("saved");
    } catch {
      setSaveState("unavailable");
    }
  }, [history.present]);
  return {
    style: history.present,
    saveState,
    change: (value: StyleSettings, group?: string) =>
      dispatch({ type: "change", value, group }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    endGroup: () => dispatch({ type: "endGroup" }),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
