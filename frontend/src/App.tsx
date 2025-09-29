import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ProfileForm } from './components/Profile/ProfileForm';
import { StatsCard } from './components/Stats/StatsCard';
import { TaskForm } from './components/Task/TaskForm';
import { TaskList } from './components/Task/TaskList';
import { Pagination } from './components/Task/Pagination';
import { Filters } from './components/Task/Filters';
import { useTasks } from './hooks/useTasks';
import './App.css';

const AppContent: React.FC = () => {
  const { user, logout, loading: authLoading, getTaskStats } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  // Use the custom hook for task management
  const {
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
    setPageSize,
    setStatusFilter,
  } = useTasks();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);


  const fetchStats = async () => {
    try {
      const statsData = await getTaskStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  // Wrapper functions to refresh stats after task operations
  const handleCreateTask = async (title: string, description: string) => {
    await createTask(title, description);
    fetchStats();
  };

  const handleUpdateTaskStatus = async (id: string, status: string) => {
    await updateTaskStatus(id, status);
    fetchStats();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    fetchStats();
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms if not logged in
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#1f2937', fontSize: '2.5rem', marginBottom: '10px' }}>
              HMCTS Task Management System
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              Efficiently manage caseworker tasks
            </p>
          </div>
          
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{ color: '#1f2937', fontSize: '2.5rem', marginBottom: '10px' }}>
              HMCTS Task Management System
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              Welcome back, {user.name}! ({user.role})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowProfileForm(true)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            Error: {error}
          </div>
        )}

        {stats && <StatsCard stats={stats} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          {/* Create Task Form */}
          <div>
            <TaskForm onSubmit={handleCreateTask} loading={loading} />
          </div>

          {/* Tasks List */}
          <div>
            <Filters
              statusFilter={statusFilter}
              pageSize={pageSize}
              totalTasks={totalTasks}
              onStatusFilterChange={setStatusFilter}
              onPageSizeChange={setPageSize}
            />
            
            <TaskList
              tasks={tasks}
              loading={loading}
              onUpdateStatus={handleUpdateTaskStatus}
              onUpdateContent={updateTaskContent}
              onDelete={handleDeleteTask}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {showProfileForm && (
          <ProfileForm onClose={() => setShowProfileForm(false)} />
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
