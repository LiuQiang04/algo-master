/**
 * Unit tests for PostDetailPage comment editing.
 * Tests the inline edit mode, edit button visibility, save/cancel behavior.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PostDetailPage from "../../pages/PostDetailPage";

const mockNavigate = jest.fn();

// Mock MarkdownRenderer since react-markdown is ESM-only
jest.mock("../../components/common/MarkdownRenderer", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "post-1" }),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../api/client", () => ({
  get: jest.fn().mockImplementation((url: string) => {
    if (url === "/posts/post-1") {
      return Promise.resolve({
        data: {
          data: {
            id: "post-1",
            title: "Test Post",
            content: "Post content",
            postType: "discussion",
            upvotes: 5,
            downvotes: 1,
            viewCount: 50,
            isPinned: false,
            isLocked: false,
            createdAt: "2024-06-01T10:00:00Z",
            user: { id: "author-1", username: "postauthor", level: 5 },
            tags: [],
            _count: { comments: 2 },
            userVote: 0,
          },
        },
      });
    }
    if (url === "/posts/post-1/comments") {
      return Promise.resolve({
        data: {
          data: {
            comments: [
              {
                id: "c1",
                content: "My comment that I can edit",
                upvotes: 3,
                downvotes: 0,
                isDeleted: false,
                createdAt: "2024-06-01T11:00:00Z",
                user: { id: "user1", username: "alice", level: 3 },
                userVote: 0,
                replies: [],
                _count: { replies: 0, votes: 3 },
              },
              {
                id: "c2",
                content: "Another user's comment",
                upvotes: 1,
                downvotes: 0,
                isDeleted: false,
                createdAt: "2024-06-01T12:00:00Z",
                user: { id: "user2", username: "bob", level: 2 },
                userVote: 0,
                replies: [],
                _count: { replies: 0, votes: 1 },
              },
            ],
          },
        },
      });
    }
    return Promise.reject(new Error("Unknown URL: " + url));
  }),
  put: jest.fn().mockResolvedValue({ data: { data: {} } }),
  post: jest.fn().mockResolvedValue({ data: { data: {} } }),
  delete: jest.fn().mockResolvedValue({ data: { data: {} } }),
}));

const mockUseAuthStore = jest.fn();

jest.mock("../../store/authStore", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("PostDetailPage - Comment Editing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: { id: "user1", username: "alice", level: 3 },
    });
  });

  describe("Edit button visibility", () => {
    it("shows Edit button for own comment", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("My comment that I can edit")).toBeInTheDocument();
      });
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("does NOT show Edit button for another user's comment", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Another user's comment")).toBeInTheDocument();
      });
      expect(screen.getAllByText("Edit").length).toBe(1); // only for c1 (owned by user1/alice)
    });
  });

  describe("Edit mode", () => {
    it("shows textarea with comment content when Edit is clicked", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));

      const textarea = screen.getByDisplayValue("My comment that I can edit");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveProperty("tagName", "TEXTAREA");
    });

    it("shows Save and Cancel buttons in edit mode", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));

      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("calls PUT /api/posts/comments/:id when Save is clicked", async () => {
      const api = require("../../api/client");
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));
      const textarea = screen.getByDisplayValue("My comment that I can edit");
      fireEvent.change(textarea, { target: { value: "Updated content" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith("/posts/comments/c1", { content: "Updated content" });
      });
    });

    it("hides edit mode and returns to normal view on Cancel", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));
      expect(screen.getByText("Save")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.queryByText("Save")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("disables Save button when edit content is empty", async () => {
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));

      const textarea = screen.getByDisplayValue("My comment that I can edit");
      fireEvent.change(textarea, { target: { value: "" } });

      const saveBtn = screen.getByText("Save");
      expect(saveBtn.closest("button")).toBeDisabled();
    });

    it("disables Cancel button when submitting", async () => {
      const api = require("../../api/client");
      // Make put hang so submitting stays true
      (api.put as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Edit"));
      fireEvent.click(screen.getByText("Save"));

      const cancelBtn = screen.getByText("Cancel");
      expect(cancelBtn.closest("button")).toBeDisabled();
    });
  });

  describe("Edge cases", () => {
    it("does NOT show Edit button when user is not logged in", async () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      renderWithRouter(<PostDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("My comment that I can edit")).toBeInTheDocument();
      });
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });
});
