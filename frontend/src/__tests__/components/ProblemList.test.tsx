/**
 * Unit tests for the ProblemList page component.
 * Tests rendering, filters, search, and pagination.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProblemList from "../../pages/Problems/ProblemList";

// Mock the services module
jest.mock("@/services/problems", () => ({
  getProblems: jest.fn().mockResolvedValue({
    items: [
      {
        id: "1",
        title: "Two Sum",
        difficulty: "easy",
        tags: ["数组", "哈希表"],
        acceptanceRate: 49.5,
        solvedCount: 1000,
        status: "solved",
      },
      {
        id: "2",
        title: "Add Two Numbers",
        difficulty: "medium",
        tags: ["链表", "数学"],
        acceptanceRate: 38.2,
        solvedCount: 800,
        status: "attempted",
      },
    ],
    total: 2,
    totalPages: 1,
  }),
  getProblemTags: jest.fn().mockResolvedValue(["数组", "哈希表", "链表", "数学"]),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("ProblemList Page", () => {
  describe("Rendering", () => {
    it("should render the page title", () => {
      renderWithRouter(<ProblemList />);
      expect(screen.getByText("题库")).toBeInTheDocument();
    });

    it("should render the problem count", async () => {
      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        const countElements = screen.getAllByText(/共 \d+ 道题目/);
        expect(countElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should render search input", () => {
      renderWithRouter(<ProblemList />);
      expect(screen.getByPlaceholderText("搜索题目编号或标题...")).toBeInTheDocument();
    });

    it("should render difficulty filter buttons", () => {
      renderWithRouter(<ProblemList />);
      const allButtons = screen.getAllByText("全部");
      expect(allButtons.length).toBeGreaterThanOrEqual(2); // 难度和状态筛选都有"全部"
      expect(screen.getByText("简单")).toBeInTheDocument();
      expect(screen.getByText("中等")).toBeInTheDocument();
      expect(screen.getByText("困难")).toBeInTheDocument();
    });

    it("should render status filter buttons", () => {
      renderWithRouter(<ProblemList />);
      expect(screen.getByText("已通过")).toBeInTheDocument();
      expect(screen.getByText("已尝试")).toBeInTheDocument();
      expect(screen.getByText("未开始")).toBeInTheDocument();
    });
  });

  describe("Problem List", () => {
    it("should render problem items", async () => {
      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        expect(screen.getByText("Two Sum")).toBeInTheDocument();
        expect(screen.getByText("Add Two Numbers")).toBeInTheDocument();
      });
    });

    it("should render difficulty badges", async () => {
      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        expect(screen.getByText("简单")).toBeInTheDocument();
        expect(screen.getByText("中等")).toBeInTheDocument();
      });
    });

    it("should render acceptance rate", async () => {
      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        expect(screen.getByText("49.5%")).toBeInTheDocument();
        expect(screen.getByText("38.2%")).toBeInTheDocument();
      });
    });
  });

  describe("Search", () => {
    it("should update search input", () => {
      renderWithRouter(<ProblemList />);
      const searchInput = screen.getByPlaceholderText("搜索题目编号或标题...");
      fireEvent.change(searchInput, { target: { value: "Two Sum" } });
      expect(searchInput).toHaveValue("Two Sum");
    });

    it("should show clear button when search has value", () => {
      renderWithRouter(<ProblemList />);
      const searchInput = screen.getByPlaceholderText("搜索题目编号或标题...");
      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
    });

    it("should clear search when clear button is clicked", () => {
      renderWithRouter(<ProblemList />);
      const searchInput = screen.getByPlaceholderText("搜索题目编号或标题...");
      fireEvent.change(searchInput, { target: { value: "test" } });
      const clearButton = screen.getByRole("button", { name: "" });
      fireEvent.click(clearButton);
      expect(searchInput).toHaveValue("");
    });
  });

  describe("Filters", () => {
    it("should change difficulty filter", () => {
      renderWithRouter(<ProblemList />);
      const easyButton = screen.getByText("简单");
      fireEvent.click(easyButton);
      expect(easyButton).toHaveClass("pl-chip--easy", "pl-chip--active");
    });

    it("should change status filter", () => {
      renderWithRouter(<ProblemList />);
      const solvedButton = screen.getByText("已通过");
      fireEvent.click(solvedButton);
      expect(solvedButton).toHaveClass("pl-chip--active");
    });

    it("should clear all filters", () => {
      renderWithRouter(<ProblemList />);
      // Apply some filters first
      fireEvent.click(screen.getByText("简单"));
      fireEvent.click(screen.getByText("已通过"));

      // Clear filters
      const clearButton = screen.getByText("清除筛选");
      fireEvent.click(clearButton);

      // Check that filters are reset - 使用 getAllByText 因为有多个"全部"按钮
      const allButtons = screen.getAllByText("全部");
      expect(allButtons[0]).toHaveClass("pl-chip--active");
    });
  });

  describe("Pagination", () => {
    it("should render pagination when there are multiple pages", async () => {
      const { getProblems } = require("@/services/problems");
      getProblems.mockResolvedValue({
        items: [],
        total: 50,
        totalPages: 5,
      });

      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        // 分页使用箭头图标，检查分页按钮是否存在
        const pageButtons = screen.getAllByRole("button");
        const paginationButtons = pageButtons.filter(btn =>
          btn.className.includes("pl-page-btn")
        );
        expect(paginationButtons.length).toBeGreaterThan(0);
      });
    });

    it("should not render pagination when there is only one page", async () => {
      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        const pageButtons = screen.getAllByRole("button");
        const paginationButtons = pageButtons.filter(btn =>
          btn.className.includes("pl-page-btn")
        );
        expect(paginationButtons.length).toBe(0);
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state initially", () => {
      const { getProblems } = require("@/services/problems");
      getProblems.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<ProblemList />);
      expect(screen.getByText("加载中...")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should handle API error gracefully", async () => {
      const { getProblems } = require("@/services/problems");
      getProblems.mockRejectedValue(new Error("API Error"));

      renderWithRouter(<ProblemList />);
      await waitFor(() => {
        expect(screen.getByText("共 0 道题目")).toBeInTheDocument();
      });
    });
  });
});
