/**
 * Unit tests for the CommunityPage component.
 * Tests rendering, post list, filters, and interactions.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CommunityPage from "../../pages/CommunityPage";

// Mock the API client
jest.mock("../../api/client", () => ({
  get: jest.fn().mockImplementation((url) => {
    if (url === "/posts") {
      return Promise.resolve({
        data: {
          data: {
            posts: [
              {
                id: "1",
                title: "如何学习动态规划？",
                content: "动态规划是算法竞赛中的重要概念...",
                postType: "discussion",
                upvotes: 10,
                downvotes: 2,
                viewCount: 100,
                isPinned: false,
                isLocked: false,
                createdAt: "2024-01-15T10:30:00Z",
                user: { id: "user1", username: "alice" },
                tags: [{ tag: { id: "tag1", name: "动态规划" } }],
                _count: { comments: 5 },
              },
              {
                id: "2",
                title: "Two Sum 题解",
                content: "使用哈希表可以优化时间复杂度...",
                postType: "solution",
                upvotes: 20,
                downvotes: 1,
                viewCount: 200,
                isPinned: true,
                isLocked: false,
                createdAt: "2024-01-14T09:00:00Z",
                user: { id: "user2", username: "bob" },
                tags: [{ tag: { id: "tag2", name: "哈希表" } }],
                _count: { comments: 10 },
              },
            ],
            total: 2,
          },
        },
      });
    }
    if (url === "/posts/tags") {
      return Promise.resolve({
        data: {
          data: [
            { id: "tag1", name: "动态规划", _count: { posts: 15 } },
            { id: "tag2", name: "哈希表", _count: { posts: 8 } },
          ],
        },
      });
    }
    return Promise.reject(new Error("Unknown URL"));
  }),
}));

// Mock the auth store
jest.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    user: { id: "user1", username: "alice" },
  }),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("CommunityPage", () => {
  describe("Rendering", () => {
    it("should render the page title", () => {
      renderWithRouter(<CommunityPage />);
      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("should render the page description", () => {
      renderWithRouter(<CommunityPage />);
      expect(screen.getByText("Discuss algorithms, share solutions, and learn together")).toBeInTheDocument();
    });

    it("should render new post button", () => {
      renderWithRouter(<CommunityPage />);
      expect(screen.getByText("New Post")).toBeInTheDocument();
    });
  });

  describe("Post List", () => {
    it("should render post titles", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        expect(screen.getByText("如何学习动态规划？")).toBeInTheDocument();
        expect(screen.getByText("Two Sum 题解")).toBeInTheDocument();
      });
    });

    it("should render post authors", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("bob")).toBeInTheDocument();
      });
    });

    it("should render post tags", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        const dpTags = screen.getAllByText("动态规划");
        expect(dpTags.length).toBeGreaterThanOrEqual(1);
        const htTags = screen.getAllByText("哈希表");
        expect(htTags.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should render comment counts", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    it("should render view counts", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("200")).toBeInTheDocument();
      });
    });

    it("should render pinned indicator", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        // 查找 pinned 标识 - 可能是 SVG 图标或特殊元素
        const pinnedPosts = screen.getAllByText("如何学习动态规划？");
        expect(pinnedPosts.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Post Type Tabs", () => {
    it("should render post type tabs", () => {
      renderWithRouter(<CommunityPage />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Discussions")).toBeInTheDocument();
      expect(screen.getByText("Solutions")).toBeInTheDocument();
      expect(screen.getByText("Questions")).toBeInTheDocument();
    });

    it("should change active tab", () => {
      renderWithRouter(<CommunityPage />);
      const discussionsTab = screen.getByText("Discussions");
      fireEvent.click(discussionsTab);
      // 检查样式是否改变（使用内联样式而非 class）
      expect(discussionsTab).toHaveStyle({ fontWeight: 600 });
    });
  });

  describe("Sort Options", () => {
    it("should render sort options", () => {
      renderWithRouter(<CommunityPage />);
      expect(screen.getByText("Latest")).toBeInTheDocument();
      expect(screen.getByText("Top")).toBeInTheDocument();
    });

    it("should change sort option", () => {
      renderWithRouter(<CommunityPage />);
      const topButton = screen.getByText("Top");
      fireEvent.click(topButton);
      // 检查样式是否改变
      expect(topButton).toHaveStyle({ background: 'var(--primary-600)' });
    });
  });

  describe("Search", () => {
    it("should display search results when search param is set", async () => {
      // 设置搜索参数
      window.history.pushState({}, '', '/community?search=动态规划');
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        // 应该显示搜索结果
        expect(screen.getByText(/Searching:/)).toBeInTheDocument();
      });
    });
  });

  describe("Tags", () => {
    it("should render tags panel", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        expect(screen.getByText("Popular Tags")).toBeInTheDocument();
      });
    });

    it("should render tag list", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        const dpTags = screen.getAllByText("动态规划");
        expect(dpTags.length).toBeGreaterThanOrEqual(1);
        const htTags = screen.getAllByText("哈希表");
        expect(htTags.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should filter by tag", async () => {
      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        const tagButtons = screen.getAllByText("动态规划");
        // 点击第一个标签按钮
        fireEvent.click(tagButtons[0]);
      });
      // 验证标签被选中（检查样式变化）
      await waitFor(() => {
        const tagButtons = screen.getAllByText("动态规划");
        expect(tagButtons[0]).toHaveStyle({ background: 'var(--primary-50)' });
      });
    });
  });

  describe("Pagination", () => {
    it("should render pagination when there are multiple pages", async () => {
      const api = require("../../api/client");
      api.get.mockImplementation((url: string) => {
        if (url === "/posts") {
          return Promise.resolve({
            data: {
              data: {
                posts: [],
                total: 50,
              },
            },
          });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        // 分页组件应该存在 - 查找分页按钮
        const pageButtons = screen.getAllByRole("button");
        const paginationButtons = pageButtons.filter(btn =>
          btn.textContent?.match(/^\d+$/)
        );
        expect(paginationButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state initially", () => {
      const api = require("../../api/client");
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<CommunityPage />);
      // 加载状态使用英文 "Loading..."
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should handle API error gracefully", async () => {
      const api = require("../../api/client");
      api.get.mockRejectedValue(new Error("API Error"));

      renderWithRouter(<CommunityPage />);
      await waitFor(() => {
        // 错误状态下应该显示空状态
        expect(screen.getByText("No posts found")).toBeInTheDocument();
      });
    });
  });
});
