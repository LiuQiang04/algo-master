/**
 * Unit tests for the App component.
 * Tests that the app renders correctly with RouterProvider.
 */

import { render } from "@testing-library/react";
import App from "../../App";

// Mock the routes module
jest.mock("@/routes", () => {
  const { createMemoryRouter } = require("react-router-dom");

  const router = createMemoryRouter([
    {
      path: "/",
      element: <div data-testid="home-page">Home Page</div>,
    },
  ]);

  return { router };
});

describe("App Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it("should render the router content", () => {
    render(<App />);

    // The app should render some content through the router
    expect(document.body.textContent).toBeTruthy();
  });
});
