import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { 
  HiOutlineClipboardList, 
  HiOutlineClock, 
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineFolder,
  HiOutlineLightningBolt
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/tasks/stats/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: <HiOutlineClipboardList />, color: 'blue' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: <HiOutlineClock />, color: 'amber' },
    { label: 'Completed', value: stats?.doneTasks || 0, icon: <HiOutlineCheckCircle />, color: 'emerald' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: <HiOutlineExclamationCircle />, color: 'rose' },
    { label: 'Projects', value: stats?.projectCount || 0, icon: <HiOutlineFolder />, color: 'violet' },
    { label: 'High Priority', value: stats?.highPriorityTasks || 0, icon: <HiOutlineLightningBolt />, color: 'orange' },
  ];

  const getStatusBadge = (status) => {
    const map = { 'todo': 'Todo', 'in-progress': 'In Progress', 'done': 'Done' };
    return <span className={`badge badge-${status}`}>{map[status] || status}</span>;
  };

  const getPriorityDot = (priority) => {
    return <span className={`priority-dot priority-${priority}`}></span>;
  };

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tasks today</p>
        </div>
        <div className="header-badge">
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {stats?.recentTasks?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Recent Tasks</h3>
          </div>
          <div className="card-body">
            <div className="task-list-compact">
              {stats.recentTasks.map((task) => (
                <div key={task._id} className="task-row">
                  <div className="task-row-left">
                    {getPriorityDot(task.priority)}
                    <span className="task-row-title">{task.title}</span>
                  </div>
                  <div className="task-row-right">
                    <span className="task-row-project">{task.project?.name}</span>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats?.tasksPerUser?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3>Tasks Per User</h3>
          </div>
          <div className="card-body">
            <div className="task-list-compact">
              {stats.tasksPerUser.map((u) => (
                <div key={u.userId} className="task-row">
                  <div className="task-row-left">
                    <div className="mini-avatar" style={{ marginLeft: 0 }}>{u.name?.charAt(0).toUpperCase()}</div>
                    <span className="task-row-title">{u.name}</span>
                    <span className="text-muted">{u.email}</span>
                  </div>
                  <div className="task-row-right">
                    <span className="badge badge-project">{u.taskCount} task{u.taskCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats?.totalTasks === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Create a project and start adding tasks to get productive!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
