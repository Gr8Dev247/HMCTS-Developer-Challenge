import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';

const defaultProps = {
  onSubmit: jest.fn(),
  loading: false,
};

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<TaskForm {...defaultProps} />);
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task description (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent;
    render(<TaskForm {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New description');
    await user.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Task', 'New description');
  });

  it('clears form after successful submission', async () => {
    const user = userEvent;
    render(<TaskForm {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New description');
    await user.click(submitButton);
    
    // Form should be cleared
    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('disables submit button when title is empty', () => {
    render(<TaskForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title is provided', async () => {
    const user = userEvent;
    render(<TaskForm {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    
    await user.type(titleInput, 'New Task');
    
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state when loading prop is true', () => {
    render(<TaskForm {...defaultProps} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: 'Creating...' });
    expect(submitButton).toBeDisabled();
  });

  it('disables inputs when loading', () => {
    render(<TaskForm {...defaultProps} loading={true} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description (optional)');
    
    expect(titleInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
  });

  it('handles empty description', async () => {
    const user = userEvent;
    render(<TaskForm {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    
    await user.type(titleInput, 'New Task');
    await user.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Task', '');
  });

  it('trims whitespace from inputs', async () => {
    const user = userEvent;
    render(<TaskForm {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    
    await user.type(titleInput, '  New Task  ');
    await user.type(descriptionInput, '  New description  ');
    await user.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('  New Task  ', '  New description  ');
  });
});
