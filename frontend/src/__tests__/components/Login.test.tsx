/**
 * Unit tests for the Login page component.
 * Tests form rendering, input handling, and validation.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../../pages/LoginPage";

// Mock the auth store
const mockLogin = jest.fn().mockResolvedValue(undefined);
jest.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    login: mockLogin,
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

describe("Login Page", () => {
  describe("Rendering", () => {
    it("should render the login form title", () => {
      renderWithRouter(<Login />);

      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    });

    it("should render the register link", () => {
      renderWithRouter(<Login />);

      expect(screen.getByText("Sign up")).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
    });

    it("should render email input field", () => {
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("Enter your username or email");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "text");
    });

    it("should render password input field", () => {
      renderWithRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText("Enter your password");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should render submit button", () => {
      renderWithRouter(<Login />);

      const submitButton = screen.getByRole("button", { name: "Sign In" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should have correct link to register page", () => {
      renderWithRouter(<Login />);

      const registerLink = screen.getByText("Sign up").closest("a");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Form Interaction", () => {
    it("should update email value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("Enter your username or email");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText("Enter your password");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should call handleSubmit on form submission", async () => {
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("Enter your username or email");
      const passwordInput = screen.getByPlaceholderText("Enter your password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Wait for async login to complete
      await screen.findByText("Sign In");

      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });
});
