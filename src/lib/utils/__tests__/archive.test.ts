import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock jszip
vi.mock("jszip", () => {
  const mockFile = vi.fn();
  const mockGenerateAsync = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
  const MockJSZip = vi.fn().mockImplementation(() => ({
    file: mockFile,
    generateAsync: mockGenerateAsync,
  }));
  return { default: MockJSZip };
});

import JSZip from "jszip";
import { buildZipFromFiles } from "@/lib/utils/archive";

describe("buildZipFromFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Uint8Array", async () => {
    const files = { "/App.tsx": "export default function App() {}" };
    const result = await buildZipFromFiles(files);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("strips leading slashes from paths", async () => {
    const files = { "/src/App.tsx": "content" };
    await buildZipFromFiles(files);
    const instance = (JSZip as any).mock.results[0].value;
    expect(instance.file).toHaveBeenCalledWith("src/App.tsx", "content");
  });

  it("does not modify paths without leading slashes", async () => {
    const files = { "src/App.tsx": "content" };
    await buildZipFromFiles(files);
    const instance = (JSZip as any).mock.results[0].value;
    expect(instance.file).toHaveBeenCalledWith("src/App.tsx", "content");
  });

  it("handles empty file map", async () => {
    const result = await buildZipFromFiles({});
    expect(result).toBeInstanceOf(Uint8Array);
    const instance = (JSZip as any).mock.results[0].value;
    expect(instance.file).not.toHaveBeenCalled();
  });

  it("adds multiple files", async () => {
    const files = {
      "/App.tsx": "app content",
      "/components/Button.tsx": "button content",
    };
    await buildZipFromFiles(files);
    const instance = (JSZip as any).mock.results[0].value;
    expect(instance.file).toHaveBeenCalledTimes(2);
    expect(instance.file).toHaveBeenCalledWith("App.tsx", "app content");
    expect(instance.file).toHaveBeenCalledWith("components/Button.tsx", "button content");
  });
});
