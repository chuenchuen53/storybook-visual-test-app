import { vi } from "vitest";

vi.mock("electron", () => ({
  app: {
    isPackaged: false,
  },
}));
