/**
 * Unit tests for the Footer component.
 * Tests content rendering and link structure.
 */

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "../../components/Layout/Footer";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Footer Component", () => {
  it("should render the about section", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("关于 AlgoMaster")).toBeInTheDocument();
    expect(screen.getByText(/AlgoMaster 是一个专业的算法竞赛学习平台/)).toBeInTheDocument();
  });

  it("should render quick links section", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("快速链接")).toBeInTheDocument();
    expect(screen.getByText("学习资源")).toBeInTheDocument();
  });

  it("should render contact section", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("联系我们")).toBeInTheDocument();
    expect(screen.getByText(/support@algomaster.com/)).toBeInTheDocument();
  });

  it("should render copyright notice", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText(/2026 AlgoMaster/)).toBeInTheDocument();
  });

  it("should have navigation links with correct destinations", () => {
    renderWithRouter(<Footer />);

    const problemsLinks = screen.getAllByText("题库");
    problemsLinks.forEach((link) => {
      expect(link.closest("a")).toHaveAttribute("href", "/problems");
    });

    const contestsLinks = screen.getAllByText("竞赛");
    contestsLinks.forEach((link) => {
      expect(link.closest("a")).toHaveAttribute("href", "/contests");
    });
  });

  it("should have resource links", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("学习路径")).toBeInTheDocument();
    expect(screen.getByText("算法题库")).toBeInTheDocument();
    expect(screen.getByText("成就系统")).toBeInTheDocument();
    expect(screen.getByText("每日挑战")).toBeInTheDocument();
  });

  it("should have gamification link", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("游戏化")).toBeInTheDocument();
    expect(screen.getByText("游戏化").closest("a")).toHaveAttribute("href", "/gamification");
  });

  it("should have the correct grid layout", () => {
    const { container } = renderWithRouter(<Footer />);

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("md:grid-cols-4");
  });
});
