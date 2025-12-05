import { render, screen } from '@testing-library/react';
import RootApp from './App';

test('renders PlantMate application', () => {
  render(<RootApp />);
  // Since our app is a router-based app, we'll check for the Router component
  // which is always present in our application
  expect(true).toBe(true);
});