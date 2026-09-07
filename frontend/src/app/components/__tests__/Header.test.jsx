import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header';
import * as navigation from 'next/navigation';

describe('Header Component', () => {
  it('renders header navigation buttons', () => {
    render(<Header />);

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invoices' })).toBeInTheDocument();
  });

  it('navigates to routes on button click', () => {
    const pushMock = vi.fn();
    vi.spyOn(navigation, 'useRouter').mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    });

    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(pushMock).toHaveBeenCalledWith('/Home');

    fireEvent.click(screen.getByRole('button', { name: 'Inventory' }));
    expect(pushMock).toHaveBeenCalledWith('/Inventory');

    fireEvent.click(screen.getByRole('button', { name: 'Invoices' }));
    expect(pushMock).toHaveBeenCalledWith('/Invoices');
  });
});
