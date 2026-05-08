import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/herbarium';

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (name, value) => {
    if (name === 'username' && (!value || value.length < 3 || value.length > 20 || !/^[a-zA-Z0-9_]+$/.test(value))) {
      return 'логін: 3-20 символів (літери, цифри, _)';
    }
    if (name === 'password' && (!value || value.length < 6)) {
      return 'пароль: мінімум 6 символів';
    }
    return '';
  };

  const onBlur = (e) => {
    const err = validate(e.target.name, e.target.value);
    setErrors((prev) => ({ ...prev, [e.target.name]: err }));
  };

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const f of ['username', 'password']) {
      const err = validate(f, form[f]);
      if (err) errs[f] = err;
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      setMsg({ type: 'error', text: 'перевірте поля' });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await login(form.username, form.password);
      setMsg({ type: 'success', text: 'успішний вхід, перенаправлення…' });
      setTimeout(() => navigate(from, { replace: true }), 400);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>вхід</h1>
        <p className="hint">
          тестові: <code>admin</code> / <code>plant1234</code>
        </p>
        <form onSubmit={onSubmit} noValidate>
          <label>
            логін
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="username"
              className={errors.username ? 'invalid' : ''}
            />
            <span className="field-error">{errors.username || ''}</span>
          </label>
          <label>
            пароль
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="current-password"
              className={errors.password ? 'invalid' : ''}
            />
            <span className="field-error">{errors.password || ''}</span>
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'входжу…' : 'увійти'}
          </button>
          {msg && (
            <div className={`form-message ${msg.type}`} role="status" aria-live="polite">
              {msg.text}
            </div>
          )}
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          ще не маєш акаунту? <Link to="/register">зареєструйся</Link>
        </p>
      </div>
    </main>
  );
}
