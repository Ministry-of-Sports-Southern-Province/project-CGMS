export const themes = [
  "theme-1",
  "theme-2",
  "theme-3",
  "theme-4",
  "theme-5",
  "theme-6",
  "theme-7",
  "theme-8",
  "theme-9",
  "theme-10",
  "theme-11",
  "theme-12"
];

export const themeColors = {
  "theme-1": "#3b82f6",
  "theme-2": "#10b981",
  "theme-3": "#f43f5e",
  "theme-4": "#f97316",
  "theme-5": "#8b5cf6",
  "theme-6": "#0ea5e9",
  "theme-7": "#22c55e",
  "theme-8": "#eab308",
  "theme-9": "#ec4899",
  "theme-10": "#14b8a6",
  "theme-11": "#a855f7",
  "theme-12": "#f59e0b"
};

export const themeLabels = {
  "theme-1": "Blue",
  "theme-2": "Emerald",
  "theme-3": "Rose",
  "theme-4": "Orange",
  "theme-5": "Violet",
  "theme-6": "Sky",
  "theme-7": "Green",
  "theme-8": "Yellow",
  "theme-9": "Pink",
  "theme-10": "Teal",
  "theme-11": "Purple",
  "theme-12": "Amber"
};

export function applyTheme({ mode, color }) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  themes.forEach((t) => root.classList.remove(t));
  if (color) root.classList.add(color);
}
