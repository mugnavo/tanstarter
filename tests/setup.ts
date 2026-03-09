import { vi } from "vitest";

// jsdom does not implement window.matchMedia, which is required by some UI
// libraries (Sonner, ThemeProvider, etc.). Mock it as a no-op stub.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
