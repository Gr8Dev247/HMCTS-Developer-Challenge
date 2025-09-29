import React from 'react';

interface FiltersProps {
  statusFilter: string;
  pageSize: number;
  totalTasks: number;
  onStatusFilterChange: (status: string) => void;
  onPageSizeChange: (size: number) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  statusFilter,
  pageSize,
  totalTasks,
  onStatusFilterChange,
  onPageSizeChange,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2 style={{ color: '#1f2937', margin: 0 }}>
        Tasks ({totalTasks})
      </h2>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: '6px 10px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  );
};
