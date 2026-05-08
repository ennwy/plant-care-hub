import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header" role="banner">
      <Link to="/" className="logo">
        <img src="/images/logo.svg" alt="логотип plant-care-hub" width="40" height="40" />
        <span>plant-care-hub</span>
      </Link>
      <nav className="main-nav" aria-label="головна навігація">
        <ul>
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>головна</NavLink></li>
          <li><NavLink to="/catalog" className={({ isActive }) => isActive ? 'active' : ''}>каталог</NavLink></li>
          {user && <li><NavLink to="/herbarium" className={({ isActive }) => isActive ? 'active' : ''}>мій гербарій</NavLink></li>}
          <li><NavLink to="/community" className={({ isActive }) => isActive ? 'active' : ''}>спільнота</NavLink></li>
          {user && <li><NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>профіль</NavLink></li>}
        </ul>
      </nav>
      <div className="auth-buttons">
        {user ? (
          <>
            <span style={{ alignSelf: 'center', fontWeight: 600 }}>{user.username}</span>
            <button onClick={onLogout} className="btn btn-ghost">вийти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">login</Link>
            <Link to="/register" className="btn btn-primary">register</Link>
          </>
        )}
      </div>
    </header>
  );
}
