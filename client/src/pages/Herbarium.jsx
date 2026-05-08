import { useEffect, useState } from 'react';
import { useAuth } from '../api/AuthContext.jsx';
import { apiGet, apiPost } from '../api/http.js';
import Loader from '../components/Loader.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';

const SPECIES = [
  { value: 'monstera', label: 'монстера' },
  { value: 'ficus', label: 'фікус' },
  { value: 'aloe', label: 'алое' },
  { value: 'orchid', label: 'орхідея' },
];

const SCHEDULE = [
  { day: 'понеділок', plant: 'моня', action: 'полив' },
  { day: 'середа', plant: 'колючка', action: 'обприскування' },
  { day: 'пʼятниця', plant: 'моня', action: 'підживлення' },
  { day: 'неділя', plant: 'колючка', action: 'полив' },
];

export default function Herbarium() {
  const { user } = useAuth();
  const [plants, setPlants] = useState(null);
  const [error, setError] = useState(null);
  const [doneRows, setDoneRows] = useState(() => new Set([0]));
  const [form, setForm] = useState({
    species: '',
    nickname: '',
    acquired_at: '',
    location: 'window',
    watering: 7,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMsg, setFormMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPlants = () => {
    apiGet('/api/plants/mine')
      .then((r) => setPlants(r.plants))
      .catch((e) => setError(e.message));
  };

  useEffect(loadPlants, []);

  const validateField = (name, value) => {
    if (name === 'nickname') {
      if (!value || value.trim().length < 2 || value.trim().length > 30) {
        return 'назва: 2-30 символів';
      }
    }
    if (name === 'species' && !value) return 'оберіть вид';
    return '';
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const f of ['nickname', 'species']) {
      const err = validateField(f, form[f]);
      if (err) errs[f] = err;
    }
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      setFormMsg({ type: 'error', text: 'перевірте поля форми' });
      return;
    }
    setSubmitting(true);
    setFormMsg(null);
    try {
      await apiPost('/api/plants', form);
      setFormMsg({ type: 'success', text: `додано "${form.nickname}"` });
      setForm({ species: '', nickname: '', acquired_at: '', location: 'window', watering: 7, notes: '' });
      loadPlants();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleScheduleRow = (i) => {
    setDoneRows((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <main className="herbarium-page">
      <WeatherWidget defaultCity={user?.city || 'Kyiv'} />

      <section className="my-plants" aria-label="мої рослини">
        <h1>мій гербарій</h1>
        {!plants && !error && <Loader label="завантаження рослин…" />}
        {error && <div className="error-block">{error}</div>}
        {plants && plants.length === 0 && <p>поки немає рослин. додай нижче.</p>}
        {plants && plants.length > 0 && (
          <div className="plants-grid">
            {plants.map((p) => (
              <article className="plant-card" key={p.id}>
                <img src={p.image || '/images/plant1.jpg'} alt={p.nickname} />
                <h3>{p.nickname} ({p.species})</h3>
                <p>наступний полив: {p.next_water || '-'}</p>
                <button className="btn btn-primary">полив зроблено</button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="schedule" aria-label="графік поливу">
        <h2>графік поливу</h2>
        <table className="schedule-table">
          <caption>що коли робити цього тижня</caption>
          <thead>
            <tr>
              <th>день</th>
              <th>рослина</th>
              <th>дія</th>
              <th>статус</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((row, i) => (
              <tr key={i} onClick={() => toggleScheduleRow(i)} style={{ cursor: 'pointer' }}>
                <td>{row.day}</td>
                <td>{row.plant}</td>
                <td>{row.action}</td>
                <td>{doneRows.has(i) ? '✓' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="add-plant" aria-label="форма додавання рослини">
        <h2>додати рослину</h2>
        <form className="plant-form" onSubmit={onSubmit} noValidate>
          <fieldset>
            <legend>основне</legend>

            <label>
              вид (з каталогу)
              <select
                name="species"
                value={form.species}
                onChange={onChange}
                onBlur={onBlur}
                className={formErrors.species ? 'invalid' : ''}
              >
                <option value="">оберіть...</option>
                {SPECIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span className="field-error">{formErrors.species || ''}</span>
            </label>

            <label>
              своя назва
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="напр. моня"
                className={formErrors.nickname ? 'invalid' : ''}
              />
              <span className="field-error">{formErrors.nickname || ''}</span>
            </label>

            <label>
              дата придбання
              <input type="date" name="acquired_at" value={form.acquired_at} onChange={onChange} />
            </label>

            <label>
              локація
              <select name="location" value={form.location} onChange={onChange}>
                <option value="window">підвіконня</option>
                <option value="balcony">балкон</option>
                <option value="kitchen">кухня</option>
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>догляд</legend>

            <label>
              частота поливу (днів): {form.watering}
              <input
                type="range"
                name="watering"
                min="1"
                max="30"
                value={form.watering}
                onChange={onChange}
              />
            </label>

            <label>
              нотатки
              <textarea
                name="notes"
                rows="4"
                value={form.notes}
                onChange={onChange}
                placeholder="особливості догляду"
              />
            </label>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'додаю…' : 'додати'}
            </button>
            <button type="reset" className="btn btn-ghost" onClick={() => { setForm({ species: '', nickname: '', acquired_at: '', location: 'window', watering: 7, notes: '' }); setFormErrors({}); setFormMsg(null); }}>
              очистити
            </button>
          </div>

          {formMsg && (
            <div className={`form-message ${formMsg.type}`} role="status" aria-live="polite">
              {formMsg.text}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
