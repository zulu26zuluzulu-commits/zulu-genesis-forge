import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock the AuthProvider hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test', email: 'test@example.com', name: 'test' },
    login: async (e: string, p: string) => { return; },
    signup: async (e: string, p: string) => { return; },
    logout: async () => {},
    isLoading: false,
    error: null,
  }),
}));

import { AppLayout } from '../layouts/AppLayout';

describe('Workspace smoke', () => {
  it('renders workspace, opens command palette, creates file', async () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );

    // Wait for welcome file to be visible in tabs
    await waitFor(() => expect(screen.getByText(/Welcome/i)).toBeTruthy());

    // Open command palette (simulate keyboard)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => expect(screen.getByPlaceholderText(/Type to search/i)).toBeTruthy());

    // Create a new file via the create action
    const createBtn = screen.getByText(/Create new file/i);
    fireEvent.click(createBtn);

    // Palette should close and new tab should appear
    await waitFor(() => expect(screen.getByText(/NewFile/i)).toBeTruthy());
  });
});
