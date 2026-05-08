import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';

const FALLBACK_PLANTS = [
  { id: 1, common_name: 'монстера', difficulty: 'легка', type: 'tropical', default_image: { thumbnail: '/images/plant1.jpg' } },
  { id: 2, common_name: 'фікус бенджаміна', difficulty: 'середня', type: 'tropical', default_image: { thumbnail: '/images/plant2.jpg' } },
  { id: 3, common_name: 'алое', difficulty: 'легка', type: 'succulent', default_image: { thumbnail: '/images/plant3.jpg' } },
  { id: 4, common_name: 'орхідея', difficulty: 'складна', type: 'flowering', default_image: { thumbnail: '/images/plant4.jpg' } },
];

export default function Catalog() {
  const [plants, setPlants] = useState(null);
  const [source, setSource] = useState('perenual');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    const key = import.meta.env.VITE_PERENUAL_KEY;
    if (!key) {
      setPlants(FALLBACK_PLANTS);
      setSource('fallback');
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(`https://perenual.com/api/species-list?key=${key}&page=1`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`perenual відповів зі статусом ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.data)) throw new Error('некоректна відповідь perenual');
        setPlants(data.data.slice(0, 24));
        setSource('perenual');
      })
      .catch((err) => {
        setError(err.name === 'AbortError' ? 'таймаут perenual' : err.message);
        setPlants(FALLBACK_PLANTS);
        setSource('fallback');
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const filtered = useMemo(() => {
    if (!plants) return [];
    return plants.filter((p) => {
      const name = (p.common_name || '').toLowerCase();
      if (query && !name.includes(query.toLowerCase())) return false;
      if (type && p.type && p.type !== type) return false;
      return true;
    });
  }, [plants, query, type]);

  return (
    <main className="catalog-page">
      <section className="catalog-controls" aria-label="фільтри каталогу">
        <h1>
          каталог рослин
          {source === 'fallback' && <span className="source-badge">offline</span>}
          {source === 'perenual' && <span className="source-badge">perenual</span>}
        </h1>
        {error && <div className="error-block">api недоступне ({error}). показано локальний список.</div>}
        <div className="controls-row">
          <label>
            пошук
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="напр. фікус"
            />
          </label>
          <label>
            тип
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">усі</option>
              <option value="succulent">сукуленти</option>
              <option value="tropical">тропічні</option>
              <option value="flowering">квітучі</option>
              <option value="cactus">кактуси</option>
            </select>
          </label>
        </div>
      </section>

      {!plants && <Loader label="каталог завантажується…" />}

      {plants && (
        <section className="plants-grid" aria-label="список рослин">
          {filtered.length === 0 && <p>нічого не знайдено</p>}
          {filtered.map((p) => (
            <article className="plant-card" key={p.id}>
              <img
                src={p.default_image?.thumbnail || p.default_image?.regular_url || '/images/plant1.jpg'}
                alt={p.common_name || 'рослина'}
                onError={(e) => { e.currentTarget.src = '/images/plant1.jpg'; }}
              />
              <h3>{p.common_name || 'без назви'}</h3>
              <p className="difficulty">
                складність: {p.difficulty || (Array.isArray(p.cycle) ? p.cycle.join(', ') : p.cycle || '-')}
              </p>
              <a href={`#plant-${p.id}`} className="btn btn-ghost">детальніше</a>
            </article>
          ))}
        </section>
      )}

      <section className="plant-scheme" aria-label="схема рослини з картою посилань">
        <h2>дізнайся більше про частини рослини</h2>
        <p>клікни на корінь, стебло чи лист, побачиш поради по тій частині.</p>
        <img
          src="/images/plant-scheme.svg"
          alt="схема рослини: корінь, стебло, лист"
          useMap="#plant-map"
          className="scheme-img"
        />
        <map name="plant-map">
          <area shape="rect" coords="50,20,250,120" alt="лист" href="#leaf" title="порада по листю" />
          <area shape="rect" coords="50,120,250,260" alt="стебло" href="#stem" title="порада по стеблу" />
          <area shape="circle" coords="150,320,80" alt="корінь" href="#root" title="порада по кореню" />
        </map>
      </section>
    </main>
  );
}
