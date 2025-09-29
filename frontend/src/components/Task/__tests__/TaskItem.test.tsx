import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../TaskItem';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'PENDING',
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const defaultProps = {
  task: mockTask,
  onUpdateStatus: jest.fn(),
  onUpdateContent: jest.fn(),
  onDelete: jest.fn(),
};

describe('TaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(<TaskItem {...defaultProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Due: 12/31/2024')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders status badge with correct color', () => {
    render(<TaskItem {...defaultProps} />);
    
    const statusBadge = screen.getByText('PENDING');
    expect(statusBadge).toHaveStyle('background-color: #fbbf24');
  });

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent;
    render(<TaskItem {...defaultProps} />);
    
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onUpdateContent when save is clicked', async () => {
    const user = userEvent;
    render(<TaskItem {...defaultProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    // Update content
    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    
    // Save
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    expect(defaultProps.onUpdateContent).toHaveBeenCalledWith(
      '1',
      'Updated Task',
      'Test description'
    );
  });

  it('cancels edit when cancel button is clicked', async () => {
    const user = userEvent;
    render(<TaskItem {...defaultProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    // Cancel
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    // Should be back to view mode
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('calls onUpdateStatus when status buttons are clicked', async () => {
    const user = userEvent;
    render(<TaskItem {...defaultProps} />);
    
    const startButton = screen.getByText('Start');
    await user.click(startButton);
    
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('1', 'IN_PROGRESS');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent;
    render(<TaskItem {...defaultProps} />);
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('shows correct status buttons based on task status', () => {
    const completedTask = { ...mockTask, status: 'COMPLETED' };
    render(<TaskItem {...defaultProps} task={completedTask} />);
    
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows reopen button for cancelled tasks', () => {
    const cancelledTask = { ...mockTask, status: 'CANCELLED' };
    render(<TaskItem {...defaultProps} task={cancelledTask} />);
    
    expect(screen.getByText('Reopen')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('displays created and updated dates', () => {
    const updatedTask = {
      ...mockTask,
      updatedAt: new Date('2024-01-02'),
    };
    render(<TaskItem {...defaultProps} task={updatedTask} />);
    
    expect(screen.getByText(/Created: 1\/1\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/Updated: 1\/2\/2024/)).toBeInTheDocument();
  });
});
