import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: jest.fn(),
};

describe('Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination controls when totalPages > 1', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('renders all page numbers', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveStyle('background-color: #3b82f6');
  });

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
    expect(previousButton).toHaveStyle('background-color: #f3f4f6');
  });

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveStyle('background-color: #f3f4f6');
  });

  it('calls onPageChange when page number is clicked', async () => {
    const user = userEvent;
    render(<Pagination {...defaultProps} />);
    
    const page3Button = screen.getByText('3');
    await user.click(page3Button);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when Previous is clicked', async () => {
    const user = userEvent;
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const previousButton = screen.getByText('Previous');
    await user.click(previousButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when Next is clicked', async () => {
    const user = userEvent;
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('does not call onPageChange when disabled buttons are clicked', async () => {
    const user = userEvent;
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const previousButton = screen.getByText('Previous');
    await user.click(previousButton);
    
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('renders correct page info', () => {
    render(<Pagination {...defaultProps} currentPage={3} totalPages={10} />);
    
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('applies correct styling to pagination container', () => {
    const { container } = render(<Pagination {...defaultProps} />);
    
    const paginationContainer = container.querySelector('div[style*="display: flex"]');
    expect(paginationContainer).toHaveStyle('justify-content: center');
  });
});
