import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineFolder, 
  HiOutlineClipboardList, 
  HiOutlineUsers, 
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/projects', icon: <HiOutlineFolder />, label: 'Projects' },
    { to: '/tasks', icon: <HiOutlineClipboardList />, label: 'Tasks' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/users', icon: <HiOutlineUsers />, label: 'Users' });
  }

  return (
    <>
      <button 
        className="sidebar-toggle" 
        onClick={() => setCollapsed(!collapsed)}
        id="sidebar-toggle"
      >
        {collapsed ? <HiOutlineMenu /> : <HiOutlineX />}
      </button>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">E</div>
          <span className="brand-text">Ethara.ai</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} id="logout-btn">
            <HiOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
