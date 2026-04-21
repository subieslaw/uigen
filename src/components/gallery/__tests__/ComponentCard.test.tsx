import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { ComponentCard, type ComponentEntry } from "@/components/gallery/ComponentCard";

const baseEntry: ComponentEntry = {
  id: "entry-1",
  prompt: "Build a counter component",
  description: "A simple interactive counter",
  projectId: "proj-1",
  createdAt: new Date("2026-01-15T10:00:00Z"),
};

describe("ComponentCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders description", () => {
    render(<ComponentCard entry={baseEntry} />);
    expect(screen.getAllByText("A simple interactive counter").length).toBeGreaterThan(0);
  });

  it("renders prompt text", () => {
    const { container } = render(<ComponentCard entry={baseEntry} />);
    const promptEl = container.querySelector("p.text-xs");
    expect(promptEl?.textContent).toBe("Build a counter component");
  });

  it("renders formatted date", () => {
    render(<ComponentCard entry={baseEntry} />);
    expect(screen.getAllByText(/Jan 15, 2026/i).length).toBeGreaterThan(0);
  });

  it("renders project link when projectId present", () => {
    render(<ComponentCard entry={baseEntry} />);
    const links = screen.getAllByRole("link", { name: /open project/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("href")).toBe("/proj-1");
  });

  it("does not render project link when projectId is null", () => {
    const entry = { ...baseEntry, projectId: null };
    const { container } = render(<ComponentCard entry={entry} />);
    expect(container.querySelector("a")).toBeNull();
  });

  it("download button triggers fetch and creates object URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["zip content"])),
    });
    global.fetch = mockFetch as any;

    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:fake-url");
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        const el = origCreateElement("a");
        el.click = mockClick;
        return el;
      }
      return origCreateElement(tag);
    });

    render(<ComponentCard entry={baseEntry} />);
    const downloadBtns = screen.getAllByRole("button", { name: /download zip/i });
    fireEvent.click(downloadBtns[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/archive/entry-1");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
    });
  });
});
