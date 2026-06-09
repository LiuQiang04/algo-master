/**
 * Unit tests for the Home page component.
 * Tests hero section, features, stats, and CTA rendering.
 */

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../pages/Home/Home";

// Mock the services module to avoid import.meta issues
jest.mock("@/services/home", () => ({
  getPopularProblems: jest.fn().mockResolvedValue([]),
  getUpcomingContests: jest.fn().mockResolvedValue([]),
}));

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
        screen.getByText(/从基础数据结构到高级算法/)
      ).toBeInTheDocument();
    });

    it("should render CTA buttons in hero section", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("开始练习")).toBeInTheDocument();
      // 使用 getAllByText 因为 "学习路径" 在导航栏和按钮中都出现
      const learnPathElements = screen.getAllByText("学习路径");
      expect(learnPathElements.length).toBeGreaterThanOrEqual(1);
    });

    it("should have correct links for CTA buttons", () => {
      renderWithRouter(<Home />);

      const startButton = screen.getByText("开始练习").closest("a");
      expect(startButton).toHaveAttribute("href", "/problems");

      // 找到 hero section 中的学习路径按钮
      const learnPathButton = screen.getByText("开始练习").closest("a")?.parentElement?.querySelector('a[href="/learn"]');
      expect(learnPathButton).toBeInTheDocument();
      expect(learnPathButton).toHaveAttribute("href", "/learn");
    });
  });

  describe("Stats Section", () => {
    it("should render all statistics", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("1,200+")).toBeInTheDocument();
      expect(screen.getByText("50,000+")).toBeInTheDocument();
      expect(screen.getByText("2,000,000+")).toBeInTheDocument();
      expect(screen.getByText("300+")).toBeInTheDocument();
    });

    it("should render stat labels", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("精选题目")).toBeInTheDocument();
      expect(screen.getByText("活跃用户")).toBeInTheDocument();
      expect(screen.getByText("代码提交")).toBeInTheDocument();
      expect(screen.getByText("竞赛举办")).toBeInTheDocument();
    });
  });

  describe("Features Section", () => {
    it("should render the features heading", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("为什么选择 Algorithm Arena")).toBeInTheDocument();
    });

    it("should render all feature cards", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("丰富的题库")).toBeInTheDocument();
      expect(screen.getByText("即时评测")).toBeInTheDocument();
      expect(screen.getByText("竞赛系统")).toBeInTheDocument();
      // 使用 getAllByText 因为 "学习路径" 在多处出现
      const learnPathElements = screen.getAllByText("学习路径");
      expect(learnPathElements.length).toBeGreaterThanOrEqual(2); // 导航栏 + 特性卡片
      expect(screen.getByText("进度追踪")).toBeInTheDocument();
      expect(screen.getByText("社区交流")).toBeInTheDocument();
    });

    it("should render feature descriptions", () => {
      renderWithRouter(<Home />);

      expect(
        screen.getByText(/涵盖数据结构、算法、数学等多个领域/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/支持 C\+\+、Java、Python 等多语言在线评测/)
      ).toBeInTheDocument();
    });
  });

  describe("CTA Section", () => {
    it("should render the final CTA heading", () => {
      renderWithRouter(<Home />);

      expect(screen.getByText("准备好开始了吗？")).toBeInTheDocument();
    });

    it("should render the final CTA button", () => {
      renderWithRouter(<Home />);

      const registerLink = screen.getByText("免费注册").closest("a");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });
});
