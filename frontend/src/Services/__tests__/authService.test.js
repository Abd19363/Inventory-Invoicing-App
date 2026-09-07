import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  isAuthenticated,
  getAccessToken,
  getUserRole,
  getUser,
  isAdmin,
  isSalesManager,
} from '../authService';

describe('authService Unit & Integration Tests with Mocking', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('register makes POST request to /auth/register and returns user data', async () => {
    const mockUserResponse = { id: 1, email: 'user@example.com', role: 'SALES_MANAGER' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUserResponse,
    });

    const result = await register('USER@EXAMPLE.COM ', 'Password123!', 'SALES_MANAGER');

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password123!',
          role: 'SALES_MANAGER',
        }),
      })
    );
    expect(result).toEqual(mockUserResponse);
  });

  it('register handles array validation errors from backend', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        detail: [{ loc: ['body', 'email'], msg: 'field required' }],
      }),
    });

    await expect(register('', 'pass')).rejects.toThrow('body.email: field required');
  });

  it('login stores tokens & user role in localStorage on success', async () => {
    const mockLoginData = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      role: 'ADMIN',
      user_id: 10,
      email: 'admin@example.com',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockLoginData,
    });

    const result = await login('admin@example.com', 'AdminPass123!');

    expect(result).toEqual(mockLoginData);
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock_access_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock_refresh_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'ADMIN');
  });

  it('login throws error when access_token is missing in response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'success but no token' }),
    });

    await expect(login('admin@example.com', 'pass')).rejects.toThrow(
      'Login succeeded but the server did not return an access token.'
    );
  });

  it('login throws error when API returns failure status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Invalid credentials' }),
    });

    await expect(login('admin@example.com', 'WrongPass')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('refreshAccessToken retrieves new token and updates localStorage', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'refreshToken') return 'existing_refresh_token';
      return null;
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ access_token: 'new_access_token' }),
    });

    const newAccessToken = await refreshAccessToken();

    expect(newAccessToken).toBe('new_access_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new_access_token');
  });

  it('refreshAccessToken throws error if no refresh token in localStorage', async () => {
    localStorage.getItem.mockReturnValue(null);
    await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('logout calls API and clears all tokens from localStorage', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'refreshToken') return 'token_to_revoke';
      return null;
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Logged out successfully' }),
    });

    await logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('isAuthenticated and role helper functions return correct state', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return 'valid_token';
      if (key === 'userRole') return 'ADMIN';
      if (key === 'user') return JSON.stringify({ id: 1, role: 'ADMIN' });
      return null;
    });

    expect(isAuthenticated()).toBe(true);
    expect(getAccessToken()).toBe('valid_token');
    expect(getUserRole()).toBe('ADMIN');
    expect(getUser()).toEqual({ id: 1, role: 'ADMIN' });
    expect(isAdmin()).toBe(true);
    expect(isSalesManager()).toBe(false);
  });
});
