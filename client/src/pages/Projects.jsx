import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineX } from 'react-icons/hi';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchProjects(); if (isAdmin) fetchUsers(); }, []);

  const fetchProjects = async () => {
    try { const { data } = await API.get('/projects'); setProjects(data); }
    catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const { data } = await API.get('/users'); setUsers(data); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) { await API.put(`/projects/${editingProject._id}`, form); toast.success('Updated'); }
      else { await API.post('/projects', form); toast.success('Created'); }
      setShowModal(false); fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await API.delete(`/projects/${id}`); toast.success('Deleted'); fetchProjects(); }
    catch { toast.error('Delete failed'); }
  };

  const addMember = async (userId) => {
    try {
      await API.post(`/projects/${selectedProject._id}/members`, { userId });
      toast.success('Member added'); fetchProjects();
      const { data } = await API.get(`/projects/${selectedProject._id}`);
      setSelectedProject(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const removeMember = async (userId) => {
    try {
      await API.delete(`/projects/${selectedProject._id}/members/${userId}`);
      toast.success('Removed'); fetchProjects();
      const { data } = await API.get(`/projects/${selectedProject._id}`);
      setSelectedProject(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Projects</h1><p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => { setEditingProject(null); setForm({ name: '', description: '' }); setShowModal(true); }} id="create-project-btn"><HiOutlinePlus /> New Project</button>}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📂</div><h3>No projects yet</h3></div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p._id} className="project-card">
              <div className="project-card-header">
                <h3>{p.name}</h3>
                {isAdmin && <div className="project-actions">
                  <button className="icon-btn" onClick={() => { setSelectedProject(p); setShowMemberModal(true); }}><HiOutlineUserAdd /></button>
                  <button className="icon-btn" onClick={() => { setEditingProject(p); setForm({ name: p.name, description: p.description || '' }); setShowModal(true); }}><HiOutlinePencil /></button>
                  <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(p._id)}><HiOutlineTrash /></button>
                </div>}
              </div>
              <p className="project-desc">{p.description || 'No description'}</p>
              <div className="project-meta">
                <div className="member-avatars">
                  {p.members?.slice(0, 5).map((m) => <div key={m._id} className="mini-avatar" title={m.name}>{m.name?.charAt(0).toUpperCase()}</div>)}
                  {p.members?.length > 5 && <div className="mini-avatar mini-avatar-more">+{p.members.length - 5}</div>}
                </div>
                <span className="project-owner">by {p.owner?.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h3>{editingProject ? 'Edit' : 'New'} Project</h3><button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingProject ? 'Update' : 'Create'}</button></div>
          </form>
        </div>
      </div>}

      {showMemberModal && selectedProject && <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h3>Members — {selectedProject.name}</h3><button className="icon-btn" onClick={() => setShowMemberModal(false)}><HiOutlineX /></button></div>
          <div className="modal-body">
            <h4 className="section-label">Current Members</h4>
            <div className="member-list">
              {selectedProject.members?.map(m => <div key={m._id} className="member-row">
                <div className="member-info"><div className="mini-avatar">{m.name?.charAt(0)}</div><div><span className="member-name">{m.name}</span><span className="member-email">{m.email}</span></div></div>
                {String(selectedProject.owner?._id) !== String(m._id) && <button className="icon-btn icon-btn-danger" onClick={() => removeMember(m._id)}><HiOutlineUserRemove /></button>}
              </div>)}
            </div>
            <h4 className="section-label" style={{marginTop:'1.5rem'}}>Add Members</h4>
            <div className="member-list">
              {users.filter(u => !selectedProject.members?.some(m => m._id === u._id)).map(u => <div key={u._id} className="member-row">
                <div className="member-info"><div className="mini-avatar">{u.name?.charAt(0)}</div><div><span className="member-name">{u.name}</span><span className="member-email">{u.email}</span></div></div>
                <button className="btn btn-sm btn-primary" onClick={() => addMember(u._id)}><HiOutlinePlus /> Add</button>
              </div>)}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Projects;
