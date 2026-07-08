export const KEYBOARD_SHORTCUTS = {
  // Search
  SEARCH: { key: "k", modifiers: ["cmd"], description: "Open search" },
  
  // Task Creation
  NEW_TASK: { key: "n", modifiers: ["cmd"], description: "Create new task" },
  
  // Navigation
  PREV_TASK: { key: "j", modifiers: [], description: "Previous task" },
  NEXT_TASK: { key: "k", modifiers: [], description: "Next task" },
  
  // Task Actions
  ARCHIVE_TASK: { key: "e", modifiers: ["cmd"], description: "Archive task" },
  DELETE_TASK: { key: "d", modifiers: ["cmd", "shift"], description: "Delete task" },
  MARK_COMPLETE: { key: "enter", modifiers: [], description: "Mark task complete" },
  
  // Filtering
  FILTER_OPEN: { key: "f", modifiers: ["cmd"], description: "Open filters" },
  CLEAR_FILTERS: { key: "c", modifiers: ["cmd", "shift"], description: "Clear filters" },
  
  // Views
  SWITCH_KANBAN: { key: "1", modifiers: ["cmd"], description: "Switch to Kanban view" },
  SWITCH_LIST: { key: "2", modifiers: ["cmd"], description: "Switch to List view" },
  SWITCH_TIMELINE: { key: "3", modifiers: ["cmd"], description: "Switch to Timeline view" },
  
  // Help
  SHOW_HELP: { key: "?", modifiers: ["shift"], description: "Show keyboard shortcuts" },
};

export function registerKeyboardShortcut(
  key: string,
  modifiers: string[],
  callback: () => void
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;
    
    const matchModifiers = modifiers.every((mod) => {
      switch (mod) {
        case "cmd":
        case "ctrl":
          return hasCtrl;
        case "shift":
          return hasShift;
        case "alt":
          return hasAlt;
        default:
          return false;
      }
    });

    if (matchModifiers && event.key.toLowerCase() === key.toLowerCase()) {
      event.preventDefault();
      callback();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }
}

export function useKeyboardShortcut(
  shortcutKey: string,
  modifiers: string[],
  callback: () => void
) {
  // This would be implemented in a custom hook in practice
  return () => registerKeyboardShortcut(shortcutKey, modifiers, callback);
}
