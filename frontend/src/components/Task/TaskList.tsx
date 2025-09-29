import React from 'react';
import { TaskItem } from './TaskItem';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateContent: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onUpdateStatus,
  onUpdateContent,
  onDelete,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        No tasks found. Create your first task!
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateStatus={onUpdateStatus}
          onUpdateContent={onUpdateContent}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
