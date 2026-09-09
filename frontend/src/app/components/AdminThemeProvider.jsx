"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUserRole } from "@/Services/authService";

export const ADMIN_THEMES = [
  {
    id: "default",
    name: "Default Theme",
    tagline: "Cyberpunk Ocean & Mint",
    description: "Deep Cyber Cyan Navy paired with fresh Emerald and Mint accents.",
    colors: {
      bg: "#051424",
      surface: "#0d1c2d",
      elevated: "#1c2b3c",
      accent: "#10b981",
      highlight: "#4edea3",
      border: "#3c4a42",
      text: "#d4e4fa",
      muted: "#bbcabf"
    },
  },
  {
    id: "primary",
    name: "Primary Theme",
    tagline: "Aurora Violet & Soft Lilac",
    description: "Immersive deep-space violet with layered amethyst surfaces and luminous soft-lilac accents.",
    colors: {
      bg: "#0d0b14",
      surface: "#13101f",
      elevated: "#1e1a30",
      accent: "#7c3aed",
      highlight: "#a78bfa",
      border: "#2e2555",
      text: "#f5f3ff",
      muted: "#c4b5fd"
    },
  },
  {
    id: "secondary",
    name: "Secondary Theme",
    tagline: "Cyber Teal & Electric Cyan",
    description: "Dark abyssal teal with elevated ink-blue surfaces and brilliant electric cyan accents.",
    colors: {
      bg: "#050e12",
      surface: "#0b1921",
      elevated: "#122130",
      accent: "#0891b2",
      highlight: "#22d3ee",
      border: "#0d3344",
      text: "#ecfeff",
      muted: "#a5f3fc"
    },
  },
  {
    id: "tertiary",
    name: "Tertiary Theme",
    tagline: "Ember Orange & Warm Amber",
    description: "Rich volcanic obsidian with warm ember surfaces and vivid molten-orange accents.",
    colors: {
      bg: "#120900",
      surface: "#1e1005",
      elevated: "#2c1a09",
      accent: "#ea580c",
      highlight: "#fb923c",
      border: "#4a2208",
      text: "#fff7ed",
      muted: "#fed7aa"
    },
  },
];

const AdminThemeContext = createContext({
  currentTheme: "default",
  setTheme: () => {},
  resetTheme: () => {},
  themes: ADMIN_THEMES,
  isAdmin: false,
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export default function AdminThemeProvider({ children }) {
  const [currentTheme, setCurrentThemeState] = useState("default");
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Apply or remove data-admin-theme attribute on documentElement
  const applyThemeToDOM = useCallback((themeId, adminStatus) => {
    if (typeof document === "undefined") return;

    if (adminStatus && themeId && themeId !== "default") {
      document.documentElement.setAttribute("data-admin-theme", themeId);
    } else {
      document.documentElement.removeAttribute("data-admin-theme");
    }
  }, []);

  // Check auth & initialize theme
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTheme = () => {
      const role = getUserRole();
      const isAdmin = role === "ADMIN";
      setIsAdminUser(isAdmin);

      if (isAdmin) {
        const savedTheme = localStorage.getItem("admin_theme") || "default";
        setCurrentThemeState(savedTheme);
        applyThemeToDOM(savedTheme, true);
      } else {
        // Non-admin accounts ALWAYS use the default app theme
        setCurrentThemeState("default");
        applyThemeToDOM("default", false);
      }
    };

    syncTheme();

    // Listen for storage events (e.g. login/logout in another tab or changes)
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, [applyThemeToDOM]);

  const setTheme = useCallback((themeId) => {
    if (typeof window === "undefined") return;

    const validTheme = ADMIN_THEMES.some((t) => t.id === themeId) ? themeId : "default";
    setCurrentThemeState(validTheme);
    localStorage.setItem("admin_theme", validTheme);

    const role = getUserRole();
    const isAdmin = role === "ADMIN";
    applyThemeToDOM(validTheme, isAdmin);
  }, [applyThemeToDOM]);

  const resetTheme = useCallback(() => {
    setTheme("default");
  }, [setTheme]);

  return (
    <AdminThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        resetTheme,
        themes: ADMIN_THEMES,
        isAdmin: isAdminUser,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}
