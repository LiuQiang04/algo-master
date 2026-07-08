/**
 * Unit tests for the CreatePostPage component.
 * Tests both create mode and edit mode behaviors.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreatePostPage from "../../pages/CreatePostPage";

// Mock the API client
jest.mock("../../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// Mock the auth store — default: authenticated
jest.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    user: { id: "user1", username: "alice" },
  }),
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseParams = jest.fn().mockReturnValue({});
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

const api = require("../../api/client");

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CreatePostPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
  });

  describe("Create Mode", () => {
    it("should render Create New Post title", () => {
      renderWithRouter(<CreatePostPage />);
      expect(screen.getByText("Create New Post")).toBeInTheDocument();
    });

    it("should render Post Type selection buttons", () => {
      renderWithRouter(<CreatePostPage />);
      expect(screen.getByText("Discussion")).toBeInTheDocument();
      expect(screen.getByText("Solution")).toBeInTheDocument();
      expect(screen.getByText("Question")).toBeInTheDocument();
    });

    it("should render submit button with Publish text", () => {
      renderWithRouter(<CreatePostPage />);
      expect(screen.getByText("Publish")).toBeInTheDocument();
    });

    it("should call api.post with correct data on submit", async () => {
      api.post.mockResolvedValue({ data: { data: { id: "new-post-1" } } });

      renderWithRouter(<CreatePostPage />);

      fireEvent.change(screen.getByPlaceholderText("Enter a descriptive title..."), {
        target: { value: "Test Post" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Write your post content here... You can use Markdown syntax."),
        { target: { value: "Test content" } },
      );

      fireEvent.click(screen.getByText("Publish"));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/posts", {
          title: "Test Post",
          content: "Test content",
          postType: "discussion",
          tagNames: [],
        });
      });
    });

    it("should navigate to the new post after create", async () => {
      api.post.mockResolvedValue({ data: { data: { id: "new-post-1" } } });

      renderWithRouter(<CreatePostPage />);

      fireEvent.change(screen.getByPlaceholderText("Enter a descriptive title..."), {
        target: { value: "Test Post" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Write your post content here... You can use Markdown syntax."),
        { target: { value: "Test content" } },
      );

      fireEvent.click(screen.getByText("Publish"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/posts/new-post-1");
      });
    });

    it('should show validation error when title is empty', () => {
      renderWithRouter(<CreatePostPage />);

      fireEvent.click(screen.getByText("Publish"));

      expect(screen.getByText("Title and content are required")).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: "post-123" });
    });

    it("should show loading state initially", () => {
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<CreatePostPage />);
      expect(screen.getByText("Loading post...")).toBeInTheDocument();
    });

    it("should load post data into the form", async () => {
      api.get.mockResolvedValue({
        data: {
          data: {
            id: "post-123",
            title: "Existing Post Title",
            content: "Existing post content body",
            postType: "solution",
            tags: [
              { tag: { id: "t1", name: "algorithm" } },
              { tag: { id: "t2", name: "dp" } },
            ],
          },
        },
      });

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Existing Post Title")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Existing post content body")).toBeInTheDocument();
      });

      expect(screen.getByText("algorithm")).toBeInTheDocument();
      expect(screen.getByText("dp")).toBeInTheDocument();
    });

    it("should show Edit Post title and Save Changes button", async () => {
      api.get.mockResolvedValue({
        data: { data: { id: "post-123", title: "Test", content: "Test", postType: "discussion" } },
      });

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByText("Edit Post")).toBeInTheDocument();
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
      });
    });

    it("should show read-only Post Type display", async () => {
      api.get.mockResolvedValue({
        data: { data: { id: "post-123", title: "Test", content: "Test", postType: "solution" } },
      });

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByText(/solution/)).toBeInTheDocument();
        expect(screen.getByText(/cannot be changed after creation/)).toBeInTheDocument();
      });

      // Post Type buttons should not exist in edit mode
      expect(screen.queryByText("General topic")).not.toBeInTheDocument();
    });

    it("should call api.put with correct data on submit", async () => {
      api.get.mockResolvedValue({
        data: { data: { id: "post-123", title: "Original Title", content: "Original content", postType: "discussion" } },
      });
      api.put.mockResolvedValue({});

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByText("Edit Post")).toBeInTheDocument();
      });

      // Modify the title
      const titleInput = screen.getByDisplayValue("Original Title");
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });

      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith("/posts/post-123", {
          title: "Updated Title",
          content: "Original content",
        });
      });
    });

    it("should navigate to the post after successful edit", async () => {
      api.get.mockResolvedValue({
        data: { data: { id: "post-123", title: "Test", content: "Test", postType: "discussion" } },
      });
      api.put.mockResolvedValue({});

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByText("Edit Post")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/posts/post-123");
      });
    });

    it("should show error on load failure", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load post")).toBeInTheDocument();
      });
    });

    it("should navigate to /community on load failure", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      renderWithRouter(<CreatePostPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/community");
      });
    });
  });
});
