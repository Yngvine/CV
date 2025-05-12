import { addIcon } from "@iconify/react";

// Update tab title
export const updateTitle = (title) => (document.title = title);

// Theme
export const getStoredTheme = () => localStorage.getItem("theme");

export const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const setTheme = (theme) => {
  if (
    theme === "auto" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
};

// Contact Form
export const postData = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  return response;
};

// utils/iconifyHelpers.js
export function registerRawSvg(name, rawSvg) {
  const svgBody = rawSvg
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "")
    .trim();

  const re = /viewBox="\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*"/i;
  const match = rawSvg.match(re);

  const [, minX, minY, width, height] = match;

  addIcon(name, {
    body: svgBody,
    width: width,
    height: height,
    // Iconify React will use `viewBox` automatically if you build the icon data with it:
    // by default, `addIcon()` does not take viewBox, but custom builds (via addCollection)
    // can include it. If you need exact control, use addCollection instead.
  });
}
