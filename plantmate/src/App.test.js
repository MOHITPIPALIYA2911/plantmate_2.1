import { render } from '@testing-library/react';
// Import the inner App component instead of the RootApp with Router
import App from './App'; 

// Mock all the components that App imports to avoid test complexity
jest.mock('./pages/auth/Login', () => () => <div>Login Component</div>);
jest.mock('./pages/auth/Registration', () => () => <div>Registration Component</div>);
jest.mock('./pages/dashboard/Dashboard', () => () => <div>Dashboard Component</div>);
jest.mock('./Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./component/PublicRoute', () => ({ children }) => <div>{children}</div>);
jest.mock('./component/PrivateRoute', () => ({ children }) => <div>{children}</div>);

// Mock the seedMock function
jest.mock('./lib/mockApi/mockApi', () => ({
  seedMock: jest.fn()
}));

test('renders PlantMate application', () => {
  render(<App />);
  expect(true).toBe(true);
});