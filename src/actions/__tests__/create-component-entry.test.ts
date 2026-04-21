import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    componentEntry: {
      create: vi.fn(),
    },
  },
}));

// Mock "use server" directive modules
vi.mock("server-only", () => ({}));

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createComponentEntry } from "@/actions/create-component-entry";

const mockGetSession = vi.mocked(getSession);
const mockCreate = vi.mocked(prisma.componentEntry.create);

describe("createComponentEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(
      createComponentEntry({ prompt: "test", description: "desc", files: {} })
    ).rejects.toThrow("Unauthorized");
  });

  it("creates entry with correct shape", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "test@test.com" });
    const fakeEntry = { id: "entry-1", userId: "user-1" };
    mockCreate.mockResolvedValue(fakeEntry as any);

    const files = { "/App.tsx": "content" };
    const result = await createComponentEntry({
      prompt: "Build a counter",
      description: "A simple counter component",
      files,
      projectId: "proj-1",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        projectId: "proj-1",
        prompt: "Build a counter",
        description: "A simple counter component",
        files: JSON.stringify(files),
      },
    });
    expect(result).toBe(fakeEntry);
  });

  it("passes null projectId when not provided", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "test@test.com" });
    mockCreate.mockResolvedValue({ id: "entry-1" } as any);

    await createComponentEntry({
      prompt: "Build a counter",
      description: "A counter",
      files: {},
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: null }),
    });
  });
});
