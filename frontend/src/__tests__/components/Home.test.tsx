/**
 * Unit tests for the Home page component.
 * Tests hero section, features, stats, and CTA rendering.
 */

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../pages/Home";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Home Page", () => {
  describe("Hero Section", () => {
    it("should render the main heading", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("算法竞赛学习平台")).toBeInTheDocument();
    });

    it("should render the subtitle", () => {
      renderWithRouter(<Home />);

      expect(
        screen.getByText(/系统学习算法，提升编程能力/)
      ).toBeInTheDocument();
    });

    it("should render CTA buttons in hero section", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("开始刷题")).toBeInTheDocument();
      expect(screen.getByText("免费注册")).toBeInTheDocument();
    });

    it("should have correct links for CTA buttons", () => {
      renderWithRouter(<Home />);

      const startButton = screen.getByText("开始刷题").closest("a");
      expect(startButton).toHaveAttribute("href", "/problems");

      const registerButton = screen.getByText("免费注册").closest("a");
      expect(registerButton).toHaveAttribute("href", "/register");
    });
  });

  describe("Stats Section", () => {
    it("should render all statistics", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("1000+")).toBeInTheDocument();
      expect(screen.getByText("5000+")).toBeInTheDocument();
      expect(screen.getByText("100+")).toBeInTheDocument();
      expect(screen.getByText("50000+")).toBeInTheDocument();
    });

    it("should render stat labels", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("题目数量")).toBeInTheDocument();
      expect(screen.getByText("用户数量")).toBeInTheDocument();
      expect(screen.getByText("竞赛次数")).toBeInTheDocument();
      expect(screen.getByText("解题次数")).toBeInTheDocument();
    });
  });

  describe("Features Section", () => {
    it("should render the features heading", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("平台特色")).toBeInTheDocument();
    });

    it("should render all feature cards", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("丰富的题库")).toBeInTheDocument();
      expect(screen.getByText("在线评测")).toBeInTheDocument();
      expect(screen.getByText("竞赛系统")).toBeInTheDocument();
      expect(screen.getByText("学习路径")).toBeInTheDocument();
      expect(screen.getByText("社区交流")).toBeInTheDocument();
      expect(screen.getByText("成就系统")).toBeInTheDocument();
    });

    it("should render feature descriptions", () => {
      renderWithRouter(<Home />);

      expect(
        screen.getByText(/涵盖各种算法和数据结构/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/实时代码评测，支持多种编程语言/)
      ).toBeInTheDocument();
    });
  });

  describe("CTA Section", () => {
    it("should render the final CTA heading", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("准备好开始学习了吗？")).toBeInTheDocument();
    });

    it("should render the final CTA button", () => {
      renderWithRouter(<Home />);

      const registerLink = screen.getByText("立即注册").closest("a");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });
});
