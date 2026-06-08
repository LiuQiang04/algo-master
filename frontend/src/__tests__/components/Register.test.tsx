/**
 * Unit tests for the Register page component.
 * Tests form rendering, input handling, and password confirmation.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "../../pages/Register";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Register Page", () => {
  describe("Rendering", () => {
    it("should render the register form title", () => {
      renderWithRouter(<Register />);

      expect(screen.getByText("注册 AlgoMaster 账号")).toBeInTheDocument();
    });

    it("should render the login link", () => {
      renderWithRouter(<Register />);

      expect(screen.getByText("立即登录")).toBeInTheDocument();
      expect(screen.getByText(/已有账号/)).toBeInTheDocument();
    });

    it("should render username input field", () => {
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("用户名");
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toBeRequired();
    });

    it("should render email input field", () => {
      renderWithRouter(<Register />);

      const emailInput = screen.getByPlaceholderText("邮箱地址");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toBeRequired();
    });

    it("should render password input field", () => {
      renderWithRouter(<Register />);

      const passwordInput = screen.getByPlaceholderText("密码");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toBeRequired();
    });

    it("should render confirm password input field", () => {
      renderWithRouter(<Register />);

      const confirmPasswordInput = screen.getByPlaceholderText("确认密码");
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toBeRequired();
    });

    it("should render terms agreement checkbox", () => {
      renderWithRouter(<Register />);

      const checkbox = screen.getByLabelText(/我同意/);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeRequired();
    });

    it("should render submit button", () => {
      renderWithRouter(<Register />);

      const submitButton = screen.getByRole("button", { name: "注册" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should have correct link to login page", () => {
      renderWithRouter(<Register />);

      const loginLink = screen.getByText("立即登录").closest("a");
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Interaction", () => {
    it("should update username value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("用户名");
      await user.type(usernameInput, "newuser");

      expect(usernameInput).toHaveValue("newuser");
    });

    it("should update email value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailInput = screen.getByPlaceholderText("邮箱地址");
      await user.type(emailInput, "new@example.com");

      expect(emailInput).toHaveValue("new@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordInput = screen.getByPlaceholderText("密码");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should update confirm password value on input", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const confirmPasswordInput = screen.getByPlaceholderText("确认密码");
      await user.type(confirmPasswordInput, "password123");

      expect(confirmPasswordInput).toHaveValue("password123");
    });
  });

  describe("Password Confirmation", () => {
    it("should alert when passwords do not match", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("用户名");
      const emailInput = screen.getByPlaceholderText("邮箱地址");
      const passwordInput = screen.getByPlaceholderText("密码");
      const confirmPasswordInput = screen.getByPlaceholderText("确认密码");
      const checkbox = screen.getByLabelText(/我同意/);
      const form = screen.getByRole("button", { name: "注册" }).closest("form")!;

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "differentpassword" } });
      fireEvent.click(checkbox);
      fireEvent.submit(form);

      expect(alertSpy).toHaveBeenCalledWith("密码不匹配");

      alertSpy.mockRestore();
    });

    it("should log registration data when passwords match", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      renderWithRouter(<Register />);

      const usernameInput = screen.getByPlaceholderText("用户名");
      const emailInput = screen.getByPlaceholderText("邮箱地址");
      const passwordInput = screen.getByPlaceholderText("密码");
      const confirmPasswordInput = screen.getByPlaceholderText("确认密码");
      const checkbox = screen.getByLabelText(/我同意/);
      const form = screen.getByRole("button", { name: "注册" }).closest("form")!;

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
      fireEvent.click(checkbox);
      fireEvent.submit(form);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Register:",
        expect.objectContaining({
          username: "newuser",
          email: "new@example.com",
          password: "password123",
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
