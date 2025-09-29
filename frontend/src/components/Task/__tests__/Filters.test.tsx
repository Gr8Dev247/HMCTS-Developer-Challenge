import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters } from '../Filters';

const defaultProps = {
  statusFilter: '',
  pageSize: 10,
  totalTasks: 25,
  onStatusFilterChange: jest.fn(),
  onPageSizeChange: jest.fn(),
};

describe('Filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task count correctly', () => {
    render(<Filters {...defaultProps} />);
    
    expect(screen.getByText('Tasks (25)')).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(<Filters {...defaultProps} />);
    
    const statusFilter = screen.getByDisplayValue('All Statuses');
    expect(statusFilter).toBeInTheDocument();
  });

  it('renders page size dropdown', () => {
    render(<Filters {...defaultProps} />);
    
    const pageSizeFilter = screen.getByDisplayValue('10 per page');
    expect(pageSizeFilter).toBeInTheDocument();
  });

  it('shows all status options', () => {
    render(<Filters {...defaultProps} />);
    
    const statusFilter = screen.getByDisplayValue('All Statuses');
    expect(statusFilter).toBeInTheDocument();
    
    // Check that all options are present
    const options = statusFilter.querySelectorAll('option');
    expect(options).toHaveLength(5); // All Statuses + 4 status options
  });

  it('shows all page size options', () => {
    render(<Filters {...defaultProps} />);
    
    const pageSizeFilter = screen.getByDisplayValue('10 per page');
    expect(pageSizeFilter).toBeInTheDocument();
    
    // Check that all options are present
    const options = pageSizeFilter.querySelectorAll('option');
    expect(options).toHaveLength(4); // 4 page size options
  });

  it('calls onStatusFilterChange when status filter changes', async () => {
    const user = userEvent;
    render(<Filters {...defaultProps} />);
    
    const statusFilter = screen.getByDisplayValue('All Statuses');
    await user.selectOptions(statusFilter, 'PENDING');
    
    expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('PENDING');
  });

  it('calls onPageSizeChange when page size changes', async () => {
    const user = userEvent;
    render(<Filters {...defaultProps} />);
    
    const pageSizeFilter = screen.getByDisplayValue('10 per page');
    await user.selectOptions(pageSizeFilter, '20');
    
    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('displays current status filter value', () => {
    render(<Filters {...defaultProps} statusFilter="PENDING" />);
    
    const statusFilter = screen.getByDisplayValue('Pending');
    expect(statusFilter).toBeInTheDocument();
  });

  it('displays current page size value', () => {
    render(<Filters {...defaultProps} pageSize={20} />);
    
    const pageSizeFilter = screen.getByDisplayValue('20 per page');
    expect(pageSizeFilter).toBeInTheDocument();
  });

  it('renders filters in correct layout', () => {
    const { container } = render(<Filters {...defaultProps} />);
    
    const header = container.querySelector('div[style*="display: flex"]');
    expect(header).toBeInTheDocument();
    expect(header).toHaveStyle('justify-content: space-between');
  });

  it('updates task count when totalTasks changes', () => {
    const { rerender } = render(<Filters {...defaultProps} />);
    
    expect(screen.getByText('Tasks (25)')).toBeInTheDocument();
    
    rerender(<Filters {...defaultProps} totalTasks={50} />);
    
    expect(screen.getByText('Tasks (50)')).toBeInTheDocument();
  });
});
