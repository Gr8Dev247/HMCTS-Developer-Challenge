import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateContent: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdateStatus,
  onUpdateContent,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#fbbf24';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleSave = () => {
    onUpdateContent(task.id, editForm.title, editForm.description);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ title: task.title, description: task.description || '' });
    setIsEditing(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {isEditing ? (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Task description"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px' }}>
                {task.title}
              </h3>
              {task.description && (
                <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                  {task.description}
                </p>
              )}
              {task.dueDate && (
                <p style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '12px' }}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              
              {task.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Start
                </button>
              )}
              
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Complete
                </button>
              )}
              
              {task.status !== 'CANCELLED' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'CANCELLED')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
              
              {task.status === 'CANCELLED' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'PENDING')}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Reopen
                </button>
              )}
            </div>
            
            <button
              onClick={() => onDelete(task.id)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
            Created: {new Date(task.createdAt).toLocaleDateString()}
            {task.updatedAt !== task.createdAt && (
              <span> • Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
