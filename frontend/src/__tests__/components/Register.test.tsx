/**
 * Unit tests for the Register page component.
 * Tests form rendering, input handling, and password confirmation.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "../../pages/RegisterPage";

// Mock the auth store
const mockRegister = jest.fn().mockResolvedValue(undefined);
jest.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    register: mockRegister,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Register Page", () => {
  describe("Rendering", () => {
    it("should render the register form title", () => {
      renderWithRouter(<Register />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    it("should render the login link", () => {
      renderWithRouter(<Register />);

      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    });

    it("should render username input field", () => {
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("Choose a username");
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute("type", "text");
    });

    it("should render email input field", () => {
      renderWithRouter(<Register />);

      const emailInput = screen.getByPlaceholderText("Enter your email");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should render password input field", () => {
      renderWithRouter(<Register />);

      const passwordInput = screen.getByPlaceholderText("At least 6 characters");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should render confirm password input field", () => {
      renderWithRouter(<Register />);

      const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    it("should render submit button", () => {
      renderWithRouter(<Register />);

      const submitButton = screen.getByRole("button", { name: "Create Account" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should have correct link to login page", () => {
      renderWithRouter(<Register />);

      const loginLink = screen.getByText("Sign in").closest("a");
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Interaction", () => {
    it("should update username value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("Choose a username");
      await user.type(usernameInput, "newuser");

      expect(usernameInput).toHaveValue("newuser");
    });

    it("should update email value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "new@example.com");

      expect(emailInput).toHaveValue("new@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordInput = screen.getByPlaceholderText("At least 6 characters");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should update confirm password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
      await user.type(confirmPasswordInput, "password123");

      expect(confirmPasswordInput).toHaveValue("password123");
    });
  });

  describe("Password Confirmation", () => {
    it("should show error when passwords do not match", () => {
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("Choose a username");
      const emailInput = screen.getByPlaceholderText("Enter your email");
      const passwordInput = screen.getByPlaceholderText("At least 6 characters");
      const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
      const form = screen.getByRole("button", { name: "Create Account" }).closest("form")!;

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "differentpassword" } });
      fireEvent.submit(form);

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    it("should log registration data when passwords match", async () => {
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("Choose a username");
      const emailInput = screen.getByPlaceholderText("Enter your email");
      const passwordInput = screen.getByPlaceholderText("At least 6 characters");
      const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
      const form = screen.getByRole("button", { name: "Create Account" }).closest("form")!;

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
      fireEvent.submit(form);

      // Wait for async register to complete
      await screen.findByText("Create Account");

      expect(mockRegister).toHaveBeenCalledWith("newuser", "new@example.com", "password123");
    });
  });

  describe("Error handling", () => {
    it("should show error message on registration failure", async () => {
      mockRegister.mockRejectedValue({
        response: { data: { message: "Email already registered" } },
      });
      renderWithRouter(<Register />);

      fireEvent.change(screen.getByPlaceholderText("Choose a username"), { target: { value: "taken" } });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "a@b.com" } });
      fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "pass123" } });
      fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "pass123" } });
      fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

      await waitFor(() => {
        expect(screen.getByText("Email already registered")).toBeInTheDocument();
      });
    });

    it("should show fallback error message when no response data", async () => {
      mockRegister.mockRejectedValue(new Error("Network error"));
      renderWithRouter(<Register />);

      fireEvent.change(screen.getByPlaceholderText("Choose a username"), { target: { value: "user" } });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "a@b.com" } });
      fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "pass123" } });
      fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "pass123" } });
      fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

      await waitFor(() => {
        expect(screen.getByText("Registration failed")).toBeInTheDocument();
      });
    });
  });

  describe("Loading state", () => {
    it("should disable submit button while loading", () => {
      mockRegister.mockImplementation(() => new Promise(() => {}));
      renderWithRouter(<Register />);

      fireEvent.change(screen.getByPlaceholderText("Choose a username"), { target: { value: "user" } });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "a@b.com" } });
      fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "pass123" } });
      fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "pass123" } });
      fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

      const submitBtn = screen.getByRole("button", { name: "Creating account..." });
      expect(submitBtn).toBeDisabled();
    });

    it("should show creating account text when loading", () => {
      mockRegister.mockImplementation(() => new Promise(() => {}));
      renderWithRouter(<Register />);

      fireEvent.change(screen.getByPlaceholderText("Choose a username"), { target: { value: "user" } });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "a@b.com" } });
      fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "pass123" } });
      fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "pass123" } });
      fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });
  });
});
