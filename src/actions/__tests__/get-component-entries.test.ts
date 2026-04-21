import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    componentEntry: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComponentEntries } from "@/actions/get-component-entries";

const mockGetSession = vi.mocked(getSession);
const mockFindMany = vi.mocked(prisma.componentEntry.findMany);

describe("getComponentEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(getComponentEntries()).rejects.toThrow("Unauthorized");
  });

  it("calls findMany with userId and correct options", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "test@test.com" });
    mockFindMany.mockResolvedValue([]);

    await getComponentEntries();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prompt: true,
        description: true,
        projectId: true,
        createdAt: true,
      },
    });
  });

  it("returns entries from prisma", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "test@test.com" });
    const fakeEntries = [
      { id: "e1", prompt: "p1", description: "d1", projectId: "proj-1", createdAt: new Date() },
      { id: "e2", prompt: "p2", description: "d2", projectId: null, createdAt: new Date() },
    ];
    mockFindMany.mockResolvedValue(fakeEntries as any);

    const result = await getComponentEntries();
    expect(result).toBe(fakeEntries);
  });
});
