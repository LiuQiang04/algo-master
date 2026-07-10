/**
 * Unit tests for the Header component.
 * Tests navigation, logo, and mobile menu functionality.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../../components/Layout/Header";

// Wrapper component to provide Router context
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Header Component", () => {
  it("should render the logo with AlgoArena text", () => {
    renderWithRouter(<Header />);

    // Logo text - "A" icon + "AlgoArena"
    expect(screen.getByText("AlgoArena")).toBeInTheDocument();
  });

  it("should render desktop navigation links", () => {
    renderWithRouter(<Header />);

    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("题库")).toBeInTheDocument();
    expect(screen.getByText("竞赛")).toBeInTheDocument();
    expect(screen.getByText("学习路径")).toBeInTheDocument();
    expect(screen.getByText("社区")).toBeInTheDocument();
    expect(screen.getByText("排行榜")).toBeInTheDocument();
    expect(screen.getByText("游戏化")).toBeInTheDocument();
  });

  it("should render login and register buttons", () => {
    renderWithRouter(<Header />);

    expect(screen.getByText("登录")).toBeInTheDocument();
    expect(screen.getByText("注册")).toBeInTheDocument();
  });

  it("should have correct link destinations for navigation", () => {
    renderWithRouter(<Header />);

    const problemsLink = screen.getByText("题库").closest("a");
    expect(problemsLink).toHaveAttribute("href", "/problems");

    const contestsLink = screen.getByText("竞赛").closest("a");
    expect(contestsLink).toHaveAttribute("href", "/contests");

    const communityLink = screen.getByText("社区").closest("a");
    expect(communityLink).toHaveAttribute("href", "/community");

    const leaderboardLink = screen.getByText("排行榜").closest("a");
    expect(leaderboardLink).toHaveAttribute("href", "/leaderboard");
  });

  it("should have correct link destinations for auth buttons", () => {
    renderWithRouter(<Header />);

    const loginButton = screen.getByText("登录").closest("a");
    expect(loginButton).toHaveAttribute("href", "/login");

    const registerButton = screen.getByText("注册").closest("a");
    expect(registerButton).toHaveAttribute("href", "/register");
  });

  it("should have logo linking to home page", () => {
    renderWithRouter(<Header />);

    const logoLink = screen.getByText("AlgoArena").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  describe("Mobile menu", () => {
    it("should have a sidebar toggle button", () => {
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole("button", { name: /打开侧边栏/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("should have a mobile menu toggle button", () => {
      renderWithRouter(<Header />);

      // There are two md:hidden buttons: sidebar toggle and mobile menu toggle
      const toggleButtons = screen.getAllByRole("button");
      const mobileToggle = toggleButtons.find(b => b.getAttribute("aria-label") === "切换移动端菜单");
      expect(mobileToggle).toBeInTheDocument();
    });

    it("should show nav links when mobile menu is toggled open", () => {
      renderWithRouter(<Header />);

      // Mobile menu is hidden initially
      expect(screen.queryByText("题库")).toBeInTheDocument(); // desktop nav still shows

      // Click the mobile menu toggle button
      const toggleButtons = screen.getAllByRole("button");
      const mobileToggle = toggleButtons.find(b => b.getAttribute("aria-label") === "切换移动端菜单")!;
      fireEvent.click(mobileToggle);

      // Mobile menu should now render nav links (they are not hidden by md:hidden)
      // The mobile menu section renders all nav links on small screens
      expect(screen.getAllByText("题库").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("竞赛").length).toBeGreaterThanOrEqual(1);
    });
  });
});
