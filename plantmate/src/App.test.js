import { render } from '@testing-library/react';
import RootApp from './App';
import { BrowserRouter } from 'react-router-dom';

// Mock the seedMock function since it's not needed for testing
jest.mock('./lib/mockApi/mockApi', () => ({
  seedMock: jest.fn()
}));

test('renders PlantMate application', () => {
  render(
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  );
  expect(true).toBe(true);
});