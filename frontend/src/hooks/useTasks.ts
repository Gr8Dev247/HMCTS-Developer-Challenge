import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  pageSize: number;
  statusFilter: string;
  createTask: (title: string, description: string) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;
  updateTaskContent: (id: string, title: string, description: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setStatusFilter: (status: string) => void;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const API_URL = 'http://localhost:3001/api';

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await axios.get(`${API_URL}/tasks?${params.toString()}`);
      setTasks(response.data.data.tasks);
      setTotalPages(response.data.data.pagination.pages);
      setTotalTasks(response.data.data.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Refetch tasks when pagination or filtering changes
  useEffect(() => {
    fetchTasks();
  }, [currentPage, pageSize, statusFilter]);

  const createTask = async (title: string, description: string) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, {
        title,
        description: description || undefined,
        status: 'PENDING'
      });
      
      setTasks([response.data.data, ...tasks]);
      setError(null);
      setCurrentPage(1); // Reset to first page
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, { status });
      setTasks(tasks.map(task => 
        task.id === id ? response.data.data : task
      ));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const updateTaskContent = async (id: string, title: string, description: string) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, { 
        title: title.trim(),
        description: description.trim() || undefined
      });
      setTasks(tasks.map(task =>
        task.id === id ? response.data.data : task
      ));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
      setCurrentPage(1); // Reset to first page
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return {
    tasks,
    loading,
    error,
    currentPage,
    totalPages,
    totalTasks,
    pageSize,
    statusFilter,
    createTask,
    updateTaskStatus,
    updateTaskContent,
    deleteTask,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    setStatusFilter: handleStatusFilterChange,
  };
};
