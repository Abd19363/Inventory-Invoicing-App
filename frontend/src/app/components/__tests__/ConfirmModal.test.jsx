import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders default title, message, and buttons when open', () => {
    render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders custom title, message, confirmLabel and warning variant', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Custom Warning Title"
        message="Custom body text"
        confirmLabel="Proceed"
        variant="warning"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Custom Warning Title')).toBeInTheDocument();
    expect(screen.getByText('Custom body text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proceed' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirmMock = vi.fn();
    render(
      <ConfirmModal isOpen={true} onConfirm={onConfirmMock} onCancel={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button or backdrop is clicked', () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancelMock} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('triggers onCancel when Escape key is pressed', () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancelMock} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
