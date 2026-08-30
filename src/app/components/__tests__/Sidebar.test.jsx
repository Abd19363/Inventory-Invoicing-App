import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';
import * as authService from '@/Services/authService';
import * as navigation from 'next/navigation';

vi.mock('@/Services/authService', () => ({
  getUserRole: vi.fn(),
  logout: vi.fn(),
}));

describe('Sidebar Component', () => {
  const setSidebarCollapsedMock = vi.fn();
  const setMobileMenuOpenMock = vi.fn();
  const pushMock = vi.fn();
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigation, 'useRouter').mockReturnValue({
      push: pushMock,
      replace: replaceMock,
      prefetch: vi.fn(),
      back: vi.fn(),
    });
  });

  it('renders navigation links and brand title', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('ADMIN');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    expect(screen.getByText('InvPro SaaS')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inventory').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invoicing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('displays Admin role badge and Create Invoice button for ADMIN role', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('ADMIN');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    expect(screen.getByText('🛡️ Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Invoice/i })).toBeInTheDocument();
  });

  it('displays Sales Manager role badge for SALES_MANAGER role', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('SALES_MANAGER');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    expect(screen.getByText('👤 Sales Manager')).toBeInTheDocument();
  });

  it('triggers setSidebarCollapsed when collapse button is clicked', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('ADMIN');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    fireEvent.click(screen.getByTitle('Collapse Sidebar Slider'));
    expect(setSidebarCollapsedMock).toHaveBeenCalledWith(true);
  });

  it('navigates when clicking brand header, create invoice, or nav item', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('ADMIN');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    fireEvent.click(screen.getByText('InvPro SaaS'));
    expect(pushMock).toHaveBeenCalledWith('/Home');

    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));
    expect(pushMock).toHaveBeenCalledWith('/Invoices/Create');

    fireEvent.click(screen.getAllByText('Reports')[0]);
    expect(pushMock).toHaveBeenCalledWith('/Reports');
  });

  it('handles logout button click', async () => {
    vi.mocked(authService.getUserRole).mockReturnValue('ADMIN');
    vi.mocked(authService.logout).mockResolvedValue();

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={false}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    fireEvent.click(screen.getAllByText('Logout')[0]);

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith('/Login');
    });
  });

  it('renders mobile menu drawer and items navigate correctly', () => {
    vi.mocked(authService.getUserRole).mockReturnValue('SALES_MANAGER');

    render(
      <Sidebar
        sidebarCollapsed={false}
        setSidebarCollapsed={setSidebarCollapsedMock}
        mobileMenuOpen={true}
        setMobileMenuOpen={setMobileMenuOpenMock}
      />
    );

    const mobileNavItem = screen.getAllByText('Dashboard')[1];
    fireEvent.click(mobileNavItem);

    expect(setMobileMenuOpenMock).toHaveBeenCalledWith(false);
    expect(pushMock).toHaveBeenCalledWith('/Home');
  });
});
