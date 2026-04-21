import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    componentEntry: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/utils/archive", () => ({
  buildZipFromFiles: vi.fn(),
}));

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildZipFromFiles } from "@/lib/utils/archive";
import { GET } from "@/app/api/archive/[entryId]/route";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.componentEntry.findUnique);
const mockBuildZip = vi.mocked(buildZipFromFiles);

function makeParams(entryId: string) {
  return { params: Promise.resolve({ entryId }) };
}

describe("GET /api/archive/[entryId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), makeParams("e1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when entry not found", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "t@t.com" });
    mockFindUnique.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), makeParams("e1"));
    expect(res.status).toBe(404);
  });

  it("returns 403 when entry belongs to different user", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "t@t.com" });
    mockFindUnique.mockResolvedValue({
      id: "e1",
      userId: "user-2",
      files: "{}",
    } as any);
    const res = await GET(new Request("http://localhost"), makeParams("e1"));
    expect(res.status).toBe(403);
  });

  it("returns zip file with correct headers on success", async () => {
    const entryId = "entry-abc";
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "t@t.com" });
    const files = { "/App.tsx": "content" };
    mockFindUnique.mockResolvedValue({
      id: entryId,
      userId: "user-1",
      files: JSON.stringify(files),
    } as any);
    const zipBytes = new Uint8Array([1, 2, 3]);
    mockBuildZip.mockResolvedValue(zipBytes);

    const res = await GET(new Request("http://localhost"), makeParams(entryId));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/zip");
    expect(res.headers.get("Content-Disposition")).toBe(
      `attachment; filename="component-${entryId}.zip"`
    );
  });

  it("calls buildZipFromFiles with parsed files", async () => {
    mockGetSession.mockResolvedValue({ userId: "user-1", email: "t@t.com" });
    const files = { "/App.tsx": "app content" };
    mockFindUnique.mockResolvedValue({
      id: "e1",
      userId: "user-1",
      files: JSON.stringify(files),
    } as any);
    mockBuildZip.mockResolvedValue(new Uint8Array());

    await GET(new Request("http://localhost"), makeParams("e1"));

    expect(mockBuildZip).toHaveBeenCalledWith(files);
  });
});
