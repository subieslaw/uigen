import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/actions", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { HeaderActions } from "@/components/HeaderActions";

const mockUser = { id: "user-1", email: "test@test.com" };

describe("HeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render gallery button for unauthenticated users", () => {
    render(<HeaderActions user={null} />);
    expect(screen.queryByRole("button", { name: /gallery/i })).toBeNull();
  });

  it("renders gallery button for authenticated users", () => {
    render(<HeaderActions user={mockUser} />);
    const btns = screen.getAllByRole("button", { name: /gallery/i });
    expect(btns.length).toBeGreaterThan(0);
  });

  it("calls onGalleryOpen when gallery button is clicked", () => {
    const onGalleryOpen = vi.fn();
    render(<HeaderActions user={mockUser} onGalleryOpen={onGalleryOpen} />);
    const btn = screen.getAllByRole("button", { name: /gallery/i })[0];
    fireEvent.click(btn);
    expect(onGalleryOpen).toHaveBeenCalledTimes(1);
  });
});
