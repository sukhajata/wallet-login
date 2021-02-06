import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('renders login button', async () => {
  render(<App />);
  const linkElement = screen.getByText(/Login/i);
  expect(linkElement).toBeInTheDocument();

});

test('renders select wallet modal', async () => {
  render(<App />);
  const linkElement = screen.getByText(/Login/i);
  expect(linkElement).toBeInTheDocument();

  fireEvent.click(screen.getByText('Login'));
  await waitFor(() => screen.getByText('Select wallet'));

  fireEvent.click(screen.getByText('MetaMask'));
});
