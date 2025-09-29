import React from 'react';

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface StatsCardProps {
  stats: TaskStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'inProgress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const statItems = [
    { key: 'total', label: 'Total', value: stats.total, color: '#1f2937' },
    { key: 'pending', label: 'Pending', value: stats.pending, color: getStatusColor('pending') },
    { key: 'inProgress', label: 'In Progress', value: stats.inProgress, color: getStatusColor('inProgress') },
    { key: 'completed', label: 'Completed', value: stats.completed, color: getStatusColor('completed') },
    { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, color: getStatusColor('cancelled') },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '30px'
    }}>
      {statItems.map((item) => (
        <div
          key={item.key}
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: item.color,
            marginBottom: '8px'
          }}>
            {item.value}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};
