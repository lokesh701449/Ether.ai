import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineFilter } from 'react-icons/hi';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ project: '', status: '', priority: '' });
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchTasks(); fetchProjects(); if (isAdmin) fetchUsers(); }, []);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.project) params.project = filters.project;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await API.get('/tasks', { params });
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try { const { data } = await API.get('/projects'); setProjects(data); } catch {}
  };

  const fetchUsers = async () => {
    try { const { data } = await API.get('/users'); setUsers(data); } catch {}
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', project: projects[0]?._id || '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditingTask(t);
    setForm({
      title: t.title, description: t.description || '', project: t.project?._id || '',
      assignedTo: t.assignedTo?._id || '', priority: t.priority, status: t.status,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.dueDate) delete payload.dueDate;
    try {
      if (editingTask) {
        if (!isAdmin) { await API.put(`/tasks/${editingTask._id}`, { status: form.status }); }
        else { await API.put(`/tasks/${editingTask._id}`, payload); }
        toast.success('Task updated');
      } else {
        await API.post('/tasks', payload);
        toast.success('Task created');
      }
      setShowModal(false); fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${id}`); toast.success('Deleted'); fetchTasks(); }
    catch { toast.error('Delete failed'); }
  };

  const quickStatus = async (task, status) => {
    try { await API.put(`/tasks/${task._id}`, { status }); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Tasks</h1><p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate} id="create-task-btn"><HiOutlinePlus /> New Task</button>}
      </div>

      <div className="filters-bar">
        <HiOutlineFilter className="filter-icon" />
        <select value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><h3>No tasks found</h3></div>
      ) : (
        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead><tr>
              <th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id} className={t.isOverdue ? 'overdue-row' : ''}>
                  <td><span className="task-title-cell">{t.title}</span></td>
                  <td><span className="badge badge-project">{t.project?.name}</span></td>
                  <td>{t.assignedTo ? <span className="assignee-chip"><span className="mini-avatar mini-avatar-xs">{t.assignedTo.name?.charAt(0)}</span>{t.assignedTo.name}</span> : <span className="text-muted">Unassigned</span>}</td>
                  <td><span className={`badge badge-priority-${t.priority}`}>{t.priority}</span></td>
                  <td>{t.dueDate ? <span className={t.isOverdue ? 'text-danger' : ''}>{new Date(t.dueDate).toLocaleDateString()}</span> : '—'}</td>
                  <td>
                    <select className={`status-select status-${t.status}`} value={t.status} onChange={e => quickStatus(t, e.target.value)}>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(t)}><HiOutlinePencil /></button>
                      {isAdmin && <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(t._id)}><HiOutlineTrash /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h3>{editingTask ? 'Edit' : 'New'} Task</h3><button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {(isAdmin || !editingTask) && <>
                <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Project</label><select value={form.project} onChange={e => setForm({...form, project: e.target.value})} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select></div>
                  <div className="form-group"><label>Assign To</label><select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select></div>
                  <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
                </div>
              </>}
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
              </select></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
};

export default Tasks;
