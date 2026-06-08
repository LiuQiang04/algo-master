/**
 * Unit tests for the Login page component.
 * Tests form rendering, input handling, and validation.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../../pages/Login";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Login Page", () => {
  describe("Rendering", () => {
    it("should render the login form title", () => {
      renderWithRouter(<Login />);

      expect(screen.getByText("登录到 AlgoMaster")).toBeInTheDocument();
    });

    it("should render the register link", () => {
      renderWithRouter(<Login />);

      expect(screen.getByText("立即注册")).toBeInTheDocument();
      expect(screen.getByText(/还没有账号/)).toBeInTheDocument();
    });

    it("should render email input field", () => {
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("邮箱地址");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toBeRequired();
    });

    it("should render password input field", () => {
      renderWithRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText("密码");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toBeRequired();
    });

    it("should render remember me checkbox", () => {
      renderWithRouter(<Login />);

      expect(screen.getByLabelText("记住我")).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      renderWithRouter(<Login />);

      expect(screen.getByText("忘记密码？")).toBeInTheDocument();
    });

    it("should render submit button", () => {
      renderWithRouter(<Login />);

      const submitButton = screen.getByRole("button", { name: "登录" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should have correct link to register page", () => {
      renderWithRouter(<Login />);

      const registerLink = screen.getByText("立即注册").closest("a");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Form Interaction", () => {
    it("should update email value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("邮箱地址");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText("密码");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should call handleSubmit on form submission", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText("邮箱地址");
      const passwordInput = screen.getByPlaceholderText("密码");
      const submitButton = screen.getByRole("button", { name: "登录" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Login:",
        expect.objectContaining({
          email: "test@example.com",
          password: "password123",
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
