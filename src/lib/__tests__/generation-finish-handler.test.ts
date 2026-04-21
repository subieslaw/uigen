import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleGenerationFinish } from "@/lib/generation-finish-handler";
import { VirtualFileSystem } from "@/lib/file-system";

describe("handleGenerationFinish", () => {
  const mockGenerateDescription = vi.fn();
  const mockSaveEntry = vi.fn();
  const mockGetSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateDescription.mockResolvedValue("A simple counter component");
    mockSaveEntry.mockResolvedValue({ id: "entry-1" });
  });

  function makeFileSystem(files?: Record<string, string>) {
    const fs = new VirtualFileSystem();
    if (files) {
      for (const [path, content] of Object.entries(files)) {
        fs.createFile(path, content);
      }
    }
    return fs;
  }

  const baseMessages = [
    { role: "user" as const, content: "Build a counter" },
    { role: "assistant" as const, content: "Sure!" },
  ];

  it("skips save when no files generated", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1" });
    const fs = makeFileSystem();

    await handleGenerationFinish({
      response: {} as any,
      projectId: "proj-1",
      messages: baseMessages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    expect(mockSaveEntry).not.toHaveBeenCalled();
  });

  it("skips save when no authenticated session", async () => {
    mockGetSession.mockResolvedValue(null);
    const fs = makeFileSystem({ "/App.tsx": "content" });

    await handleGenerationFinish({
      response: {} as any,
      projectId: "proj-1",
      messages: baseMessages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    expect(mockSaveEntry).not.toHaveBeenCalled();
  });

  it("calls generateDescription with the last user message and file map", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1" });
    const fs = makeFileSystem({ "/App.tsx": "content" });
    const messages = [
      { role: "user" as const, content: "First message" },
      { role: "assistant" as const, content: "OK" },
      { role: "user" as const, content: "Build a counter" },
    ];

    await handleGenerationFinish({
      response: {} as any,
      projectId: "proj-1",
      messages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    expect(mockGenerateDescription).toHaveBeenCalledWith(
      "Build a counter",
      expect.any(Map)
    );
  });

  it("extracts the last user message as prompt", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1" });
    const fs = makeFileSystem({ "/App.tsx": "content" });
    const messages = [
      { role: "user" as const, content: "First message" },
      { role: "user" as const, content: "Last user message" },
    ];

    await handleGenerationFinish({
      response: {} as any,
      projectId: undefined,
      messages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    const [prompt] = mockGenerateDescription.mock.calls[0];
    expect(prompt).toBe("Last user message");
  });

  it("calls saveEntry with correct data", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1" });
    const fs = makeFileSystem({ "/App.tsx": "content" });

    await handleGenerationFinish({
      response: {} as any,
      projectId: "proj-1",
      messages: baseMessages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    expect(mockSaveEntry).toHaveBeenCalledWith({
      prompt: "Build a counter",
      description: "A simple counter component",
      files: expect.any(Object),
      projectId: "proj-1",
      userId: "user-1",
    });
  });

  it("passes files as plain object to saveEntry", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1" });
    const fs = makeFileSystem({ "/App.tsx": "app content", "/Button.tsx": "btn content" });

    await handleGenerationFinish({
      response: {} as any,
      projectId: undefined,
      messages: baseMessages,
      fileSystem: fs,
      generateDescription: mockGenerateDescription,
      saveEntry: mockSaveEntry,
      getSession: mockGetSession,
    });

    const { files } = mockSaveEntry.mock.calls[0][0];
    expect(files).toMatchObject({
      "/App.tsx": "app content",
      "/Button.tsx": "btn content",
    });
  });
});
