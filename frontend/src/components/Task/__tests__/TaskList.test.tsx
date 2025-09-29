import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../TaskList';

const mockTasks = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'PENDING',
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'IN_PROGRESS',
    dueDate: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const defaultProps = {
  tasks: mockTasks,
  loading: false,
  onUpdateStatus: jest.fn(),
  onUpdateContent: jest.fn(),
  onDelete: jest.fn(),
};

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when loading is true', () => {
    render(<TaskList {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);
    
    expect(screen.getByText('No tasks found. Create your first task!')).toBeInTheDocument();
  });

  it('renders all tasks when tasks are provided', () => {
    render(<TaskList {...defaultProps} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders tasks in a grid layout', () => {
    const { container } = render(<TaskList {...defaultProps} />);
    
    const taskGrid = container.querySelector('div[style*="display: grid"]');
    expect(taskGrid).toBeInTheDocument();
  });

  it('passes correct props to TaskItem components', () => {
    render(<TaskList {...defaultProps} />);
    
    // Check that TaskItem components receive the correct props
    // This is tested indirectly through the rendering of task content
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('handles tasks with null descriptions', () => {
    const tasksWithNullDescription = [
      {
        ...mockTasks[0],
        description: null,
      },
    ];
    
    render(<TaskList {...defaultProps} tasks={tasksWithNullDescription} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    // Description should not be rendered when null
    expect(screen.queryByText('Description 1')).not.toBeInTheDocument();
  });

  it('handles tasks with null due dates', () => {
    const tasksWithNullDueDate = [
      {
        ...mockTasks[0],
        dueDate: null,
      },
    ];
    
    render(<TaskList {...defaultProps} tasks={tasksWithNullDueDate} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    // Due date should not be rendered when null
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });
});
