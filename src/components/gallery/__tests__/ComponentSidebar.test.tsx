import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup, within } from "@testing-library/react";

vi.mock("@/actions/get-component-entries", () => ({
  getComponentEntries: vi.fn(),
}));

import { getComponentEntries } from "@/actions/get-component-entries";
import { ComponentSidebar } from "@/components/gallery/ComponentSidebar";

const mockGetComponentEntries = vi.mocked(getComponentEntries);

const fakeEntries = [
  {
    id: "e1",
    prompt: "Build a counter",
    description: "A counter component",
    projectId: "proj-1",
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "e2",
    prompt: "Build a form",
    description: "A contact form",
    projectId: null,
    createdAt: new Date("2026-01-02"),
  },
];

describe("ComponentSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetComponentEntries.mockResolvedValue(fakeEntries as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when open is false", () => {
    render(<ComponentSidebar open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Component Gallery")).toBeNull();
  });

  it("shows heading when open is true", async () => {
    render(<ComponentSidebar open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Component Gallery")).toBeDefined();
  });

  it("calls getComponentEntries when open", async () => {
    render(<ComponentSidebar open={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(mockGetComponentEntries).toHaveBeenCalledTimes(1);
    });
  });

  it("renders a ComponentCard per entry", async () => {
    render(<ComponentSidebar open={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("A counter component")).toBeDefined();
      expect(screen.getByText("A contact form")).toBeDefined();
    });
  });

  it("shows 'No components yet' empty state", async () => {
    mockGetComponentEntries.mockResolvedValue([]);
    render(<ComponentSidebar open={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/no components yet/i)).toBeDefined();
    });
  });

  it("shows loading state initially", async () => {
    mockGetComponentEntries.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([] as any), 200))
    );
    render(<ComponentSidebar open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<ComponentSidebar open={true} onClose={onClose} />);
    // Find the panel element and close button within it
    const panel = container.querySelector('[class*="fixed inset-y-0"]') as HTMLElement;
    const closeBtn = panel
      ? within(panel).getByRole("button", { name: /close gallery/i })
      : screen.getAllByRole("button", { name: /close gallery/i })[0];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
