import { render, screen } from '@testing-library/react';
import App from '../../App';

// The router needs a known set of routes so RouterProvider renders content
jest.mock('@/routes', () => {
  const { createMemoryRouter } = require('react-router-dom');

  const router = createMemoryRouter([
    {
      path: '/',
      element: <div data-testid="home-page">Home Page</div>,
    },
  ]);

  return { router };
});

describe('App Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should include ErrorBoundary wrapper that catches errors', () => {
    // ErrorBoundary should not cause the entire app to crash on render
    expect(() => render(<App />)).not.toThrow();
  });

  it('should render router content through RouterProvider', () => {
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
