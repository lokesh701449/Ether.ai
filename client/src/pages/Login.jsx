import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ParticleBackground from '../components/ParticleBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ParticleBackground />
      <div className="auth-container">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-logo">E</div>
            <h1>Ethara.ai</h1>
            <p>Team Task Manager</p>
            <div className="auth-visual-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
                id="login-submit"
              >
                {loading ? <span className="spinner-sm"></span> : 'Sign In'}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>

            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              background: 'rgba(91,154,166,0.06)',
              border: '1px solid rgba(91,154,166,0.12)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.7'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--teal)', marginBottom: '0.35rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Demo Credentials
              </div>
              <div><strong>Admin:</strong> lokesh@ethara.ai / admin123</div>
              <div><strong>Member:</strong> priya@ethara.ai / member123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
