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
  it("should render the logo with AlgoMaster text", () => {
    renderWithRouter(<Header />);

    expect(screen.getByText("AlgoMaster")).toBeInTheDocument();
  });

  it("should render desktop navigation links", () => {
    renderWithRouter(<Header />);

    expect(screen.getByText("题库")).toBeInTheDocument();
    expect(screen.getByText("竞赛")).toBeInTheDocument();
    expect(screen.getByText("社区")).toBeInTheDocument();
    expect(screen.getByText("排行榜")).toBeInTheDocument();
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

    const logoLink = screen.getByText("AlgoMaster").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  describe("Mobile menu", () => {
    it("should have a mobile menu button", () => {
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole("button");
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass("md:hidden");
    });

    it("should toggle mobile menu when button is clicked", () => {
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole("button");

      // Menu should be hidden initially
      // Click to open
      fireEvent.click(menuButton);

      // After clicking, mobile nav links should be visible
      // The mobile menu contains duplicate links
      const mobileLinks = screen.getAllByText("题库");
      expect(mobileLinks.length).toBeGreaterThan(1);
    });

    it("should close mobile menu when button is clicked again", () => {
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole("button");

      // Open menu
      fireEvent.click(menuButton);
      // Close menu
      fireEvent.click(menuButton);

      // After closing, only desktop links should be visible
      const links = screen.getAllByText("题库");
      expect(links.length).toBe(1);
    });
  });
});
