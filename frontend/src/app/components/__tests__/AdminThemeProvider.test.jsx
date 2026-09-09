import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AdminThemeProvider, { useAdminTheme, ADMIN_THEMES } from "../AdminThemeProvider";
import * as authService from "@/Services/authService";

function TestConsumer() {
  const { currentTheme, setTheme, resetTheme, themes, isAdmin } = useAdminTheme();

  return (
    <div>
      <span data-testid="current-theme">{currentTheme}</span>
      <span data-testid="is-admin">{isAdmin ? "admin" : "non-admin"}</span>
      <span data-testid="theme-count">{themes.length}</span>
      <button onClick={() => setTheme("primary")} data-testid="btn-primary">
        Set Primary
      </button>
      <button onClick={() => setTheme("secondary")} data-testid="btn-secondary">
        Set Secondary
      </button>
      <button onClick={() => setTheme("tertiary")} data-testid="btn-tertiary">
        Set Tertiary
      </button>
      <button onClick={() => setTheme("default")} data-testid="btn-default">
        Set Default
      </button>
      <button onClick={resetTheme} data-testid="btn-reset">
        Reset
      </button>
    </div>
  );
}

describe("AdminThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-admin-theme");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-admin-theme");
  });

  it("exports 4 predefined themes", () => {
    expect(ADMIN_THEMES).toHaveLength(4);
    expect(ADMIN_THEMES.map((t) => t.id)).toEqual([
      "default",
      "primary",
      "secondary",
      "tertiary",
    ]);
  });

  it("defaults to 'default' theme and removes data-admin-theme for non-admin", () => {
    vi.spyOn(authService, "getUserRole").mockReturnValue("SALES_MANAGER");

    render(
      <AdminThemeProvider>
        <TestConsumer />
      </AdminThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("default");
    expect(screen.getByTestId("is-admin").textContent).toBe("non-admin");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBeNull();
  });

  it("loads saved theme from localStorage for admin", () => {
    vi.spyOn(authService, "getUserRole").mockReturnValue("ADMIN");
    localStorage.setItem("admin_theme", "primary");

    render(
      <AdminThemeProvider>
        <TestConsumer />
      </AdminThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("primary");
    expect(screen.getByTestId("is-admin").textContent).toBe("admin");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBe("primary");
  });

  it("allows admin to switch themes (primary, secondary, tertiary, default)", () => {
    vi.spyOn(authService, "getUserRole").mockReturnValue("ADMIN");

    render(
      <AdminThemeProvider>
        <TestConsumer />
      </AdminThemeProvider>
    );

    // Initial default
    expect(document.documentElement.getAttribute("data-admin-theme")).toBeNull();

    // Switch to Primary
    fireEvent.click(screen.getByTestId("btn-primary"));
    expect(screen.getByTestId("current-theme").textContent).toBe("primary");
    expect(localStorage.getItem("admin_theme")).toBe("primary");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBe("primary");

    // Switch to Secondary
    fireEvent.click(screen.getByTestId("btn-secondary"));
    expect(screen.getByTestId("current-theme").textContent).toBe("secondary");
    expect(localStorage.getItem("admin_theme")).toBe("secondary");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBe("secondary");

    // Switch to Tertiary
    fireEvent.click(screen.getByTestId("btn-tertiary"));
    expect(screen.getByTestId("current-theme").textContent).toBe("tertiary");
    expect(localStorage.getItem("admin_theme")).toBe("tertiary");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBe("tertiary");

    // Switch back to Default
    fireEvent.click(screen.getByTestId("btn-default"));
    expect(screen.getByTestId("current-theme").textContent).toBe("default");
    expect(localStorage.getItem("admin_theme")).toBe("default");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBeNull();

    // Switch to primary then call resetTheme
    fireEvent.click(screen.getByTestId("btn-primary"));
    expect(document.documentElement.getAttribute("data-admin-theme")).toBe("primary");
    fireEvent.click(screen.getByTestId("btn-reset"));
    expect(screen.getByTestId("current-theme").textContent).toBe("default");
    expect(document.documentElement.getAttribute("data-admin-theme")).toBeNull();
  });
});
