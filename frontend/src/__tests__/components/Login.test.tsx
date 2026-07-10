import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/LoginPage';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderPage() {
  return render(<BrowserRouter><Login /></BrowserRouter>);
}

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderPage();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('should render username/email input', () => {
      renderPage();
      const input = screen.getByPlaceholderText('Enter your username or email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render password input', () => {
      renderPage();
      const input = screen.getByPlaceholderText('Enter your password');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render submit button', () => {
      renderPage();
      const btn = screen.getByRole('button', { name: 'Sign In' });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('type', 'submit');
    });

    it('should render register link', () => {
      renderPage();
      const link = screen.getByText('Sign up').closest('a');
      expect(link).toHaveAttribute('href', '/register');
    });

    it('should render password visibility toggle', () => {
      renderPage();
      const toggleBtn = screen.getByRole('button', { name: '' });
      expect(toggleBtn).toBeInTheDocument();
    });
  });

  describe('Form interaction', () => {
    it('should update email field on input', () => {
      renderPage();
      const input = screen.getByPlaceholderText('Enter your username or email');
      fireEvent.change(input, { target: { value: 'user@test.com' } });
      expect(input).toHaveValue('user@test.com');
    });

    it('should update password field on input', () => {
      renderPage();
      const input = screen.getByPlaceholderText('Enter your password');
      fireEvent.change(input, { target: { value: 'secret123' } });
      expect(input).toHaveValue('secret123');
    });

    it('should toggle password visibility', () => {
      renderPage();
      const input = screen.getByPlaceholderText('Enter your password');
      const toggleBtn = screen.getAllByRole('button')[0]; // toggle button (not submit)

      expect(input).toHaveAttribute('type', 'password');
      fireEvent.click(toggleBtn);
      expect(input).toHaveAttribute('type', 'text');
      fireEvent.click(toggleBtn);
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Validation', () => {
    it('should show error when submitting empty form', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    it('should show error when only email is filled', () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'user' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    it('should show error when only password is filled', () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show signing in text when loading', () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('should disable submit button while loading', () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });
  });

  describe('Error state', () => {
    it('should display API error message on failed login', async () => {
      mockLogin.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      });
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'bad@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should use fallback error message when no response data', async () => {
      mockLogin.mockRejectedValue(new Error('Network Error'));
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });
  });

  describe('Successful login', () => {
    it('should navigate to community on success', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/community');
      });
    });

    it('should call login with correct credentials', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('Enter your username or email'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'mypassword' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'mypassword');
      });
    });
  });
});
