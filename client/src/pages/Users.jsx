import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const { data } = await API.get('/users'); setUsers(data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Users</h1><p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p></div>
      </div>
      {users.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div>
      ) : (
        <div className="users-grid">
          {users.map(u => (
            <div key={u._id} className="user-card">
              <div className="user-card-avatar">{u.name?.charAt(0).toUpperCase()}</div>
              <h3>{u.name}</h3>
              <p className="user-card-email">{u.email}</p>
              <span className={`role-badge role-${u.role}`}>{u.role}</span>
              <p className="user-card-date">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
