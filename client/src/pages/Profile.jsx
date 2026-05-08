import { useEffect, useState } from 'react';
import { useAuth } from '../api/AuthContext.jsx';
import { apiGet } from '../api/http.js';
import Loader from '../components/Loader.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/api/users/me/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="profile-page">
      <h1>профіль</h1>
      <div className="profile-card">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '?')}&background=2f7d32&color=fff&size=192`}
          alt="аватар"
        />
        <div>
          <h2>{user?.username}</h2>
          <p>місто: {user?.city || '-'}</p>
          <p>дата реєстрації: {user?.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : '-'}</p>
        </div>
      </div>

      {!stats && !error && <Loader label="статистика…" />}
      {error && <div className="error-block">{error}</div>}
      {stats && (
        <div className="profile-stats">
          <div><strong>{stats.plants}</strong>рослин</div>
          <div><strong>{stats.tips}</strong>порад</div>
          <div><strong>{stats.waterings}</strong>поливів</div>
        </div>
      )}
    </main>
  );
}
