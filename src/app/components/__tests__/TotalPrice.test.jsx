import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TotalPrice from '../TotalPrice';

describe('TotalPrice Component', () => {
  it('renders total price calculation correctly', () => {
    render(<TotalPrice quantity={5} priceperquantity={100} />);

    expect(screen.getByText('Total Price')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('handles missing or invalid props gracefully', () => {
    render(<TotalPrice quantity={null} priceperquantity={undefined} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles string input values', () => {
    render(<TotalPrice quantity="3" priceperquantity="25.5" />);

    expect(screen.getByText('76.5')).toBeInTheDocument();
  });
});
