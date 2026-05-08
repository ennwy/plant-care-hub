import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', confirm: '', city: 'Kyiv' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (name, value, full = form) => {
    if (name === 'username') {
      if (!value || value.length < 3 || value.length > 20 || !/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'логін: 3-20 символів (літери, цифри, _)';
      }
    }
    if (name === 'password') {
      if (!value || value.length < 6) return 'пароль: мінімум 6 символів';
    }
    if (name === 'confirm') {
      if (value !== full.password) return 'паролі не співпадають';
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
    for (const f of ['username', 'password', 'confirm']) {
      const err = validate(f, form[f], form);
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
      await register({ username: form.username, password: form.password, city: form.city });
      setMsg({ type: 'success', text: 'акаунт створено' });
      setTimeout(() => navigate('/herbarium'), 400);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>реєстрація</h1>
        <p className="hint">створи акаунт, щоб додавати рослини</p>
        <form onSubmit={onSubmit} noValidate>
          <label>
            логін
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              onBlur={onBlur}
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
              className={errors.password ? 'invalid' : ''}
            />
            <span className="field-error">{errors.password || ''}</span>
          </label>
          <label>
            повторити пароль
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              onBlur={onBlur}
              className={errors.confirm ? 'invalid' : ''}
            />
            <span className="field-error">{errors.confirm || ''}</span>
          </label>
          <label>
            місто (для погоди)
            <input type="text" name="city" value={form.city} onChange={onChange} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'створюю…' : 'зареєструватись'}
          </button>
          {msg && (
            <div className={`form-message ${msg.type}`} role="status" aria-live="polite">
              {msg.text}
            </div>
          )}
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          вже маєш акаунт? <Link to="/login">увійди</Link>
        </p>
      </div>
    </main>
  );
}
