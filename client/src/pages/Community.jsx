import { useEffect, useState } from 'react';
import { useAuth } from '../api/AuthContext.jsx';
import { apiGet, apiPost } from '../api/http.js';
import Loader from '../components/Loader.jsx';

export default function Community() {
  const { user } = useAuth();
  const [tips, setTips] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({});

  const [form, setForm] = useState({ title: '', email: '', body: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formMsg, setFormMsg] = useState(null);

  useEffect(() => {
    apiGet('/api/tips?limit=2&page=1')
      .then((r) => {
        setTips(r.tips);
        setHasMore(r.tips.length >= 2);
      })
      .catch((e) => setError(e.message));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await apiGet(`/api/tips?limit=2&page=${next}`);
      if (r.tips.length === 0) {
        setHasMore(false);
      } else {
        setTips((prev) => [...prev, ...r.tips]);
        setPage(next);
        if (r.tips.length < 2) setHasMore(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = (id) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validate = (name, value) => {
    if (name === 'title' && (!value || value.length < 3)) return 'мінімум 3 символи';
    if (name === 'body' && (!value || value.length < 10)) return 'мінімум 10 символів';
    if (name === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'некоректний email';
    return '';
  };

  const onBlur = (e) => {
    const err = validate(e.target.name, e.target.value);
    setFormErrors((prev) => ({ ...prev, [e.target.name]: err }));
  };

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const f of ['title', 'body', 'email']) {
      const err = validate(f, form[f]);
      if (err) errs[f] = err;
    }
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      setFormMsg({ type: 'error', text: 'перевірте поля' });
      return;
    }
    try {
      const created = await apiPost('/api/tips', form);
      setTips((prev) => [created.tip, ...(prev || [])]);
      setForm({ title: '', email: '', body: '' });
      setFormMsg({ type: 'success', text: 'опубліковано' });
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <main className="community-page">
      <section className="tips-feed" aria-label="стрічка порад">
        <h1>спільнота</h1>
        {!tips && !error && <Loader label="завантаження стрічки…" />}
        {error && <div className="error-block">{error}</div>}
        {tips && tips.map((t) => (
          <article className="tip-post" key={t.id}>
            <header className="tip-post-head">
              <img src={t.avatar || '/images/avatar1.png'} alt={`аватар ${t.author}`} />
              <div>
                <strong>{t.author}</strong>
                <time dateTime={t.created_at}>{new Date(t.created_at).toLocaleDateString('uk-UA')}</time>
              </div>
            </header>
            {t.title && <h3>{t.title}</h3>}
            <p>{t.body}</p>
            <footer className="tip-post-foot">
              <button className="btn btn-ghost" onClick={() => toggleLike(t.id)}>
                ♥ {(t.likes || 0) + (likes[t.id] ? 1 : 0)}
              </button>
              <button className="btn btn-ghost">коментарі ({t.comments || 0})</button>
            </footer>
          </article>
        ))}
        {tips && hasMore && (
          <button className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'завантажую…' : 'показати ще'}
          </button>
        )}
      </section>

      <aside className="add-tip" aria-label="форма додавання поради">
        <h2>поділись порадою</h2>
        {!user && <p className="hint">потрібно <a href="/login">увійти</a>, щоб публікувати</p>}
        <form onSubmit={onSubmit} noValidate>
          <label>
            заголовок
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChange}
              onBlur={onBlur}
              disabled={!user}
              className={formErrors.title ? 'invalid' : ''}
            />
            <span className="field-error">{formErrors.title || ''}</span>
          </label>
          <label>
            email (для відповіді)
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              disabled={!user}
              className={formErrors.email ? 'invalid' : ''}
            />
            <span className="field-error">{formErrors.email || ''}</span>
          </label>
          <label>
            текст
            <textarea
              name="body"
              rows="5"
              value={form.body}
              onChange={onChange}
              onBlur={onBlur}
              disabled={!user}
              className={formErrors.body ? 'invalid' : ''}
            />
            <span className="field-error">{formErrors.body || ''}</span>
          </label>
          <button type="submit" className="btn btn-primary" disabled={!user}>опублікувати</button>
          {formMsg && (
            <div className={`form-message ${formMsg.type}`} role="status" aria-live="polite">
              {formMsg.text}
            </div>
          )}
        </form>
      </aside>
    </main>
  );
}
