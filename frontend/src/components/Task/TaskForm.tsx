import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (title: string, description: string) => void;
  loading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading = false }) => {
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onSubmit(newTask.title, newTask.description);
      setNewTask({ title: '', description: '' });
    }
  };

  return (
    <div>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Create New Task</h2>
      <form onSubmit={handleSubmit} style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Title *
          </label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="Enter task title"
            required
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Enter task description (optional)"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newTask.title.trim()}
          style={{
            backgroundColor: loading || !newTask.title.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: loading || !newTask.title.trim() ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};
