import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <a href="https://healthunveiled.world" target="_blank" rel="noopener noreferrer" className="sidebar-brand-link">
            <strong>Health Unveiled</strong>
            Admin
          </a>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/people" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            People
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Inbox
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
