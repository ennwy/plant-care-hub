import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import Loader from '../components/Loader.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'доброї ночі';
  if (h < 12) return 'доброго ранку';
  if (h < 18) return 'доброго дня';
  return 'доброго вечора';
}

export default function Home() {
  const [tips, setTips] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/api/tips?limit=3')
      .then((res) => setTips(res.tips))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main>
      <section className="hero" id="hero">
        <div className="hero-text">
          <h1>{greeting()}, гостю!</h1>
          <p className="lead">
            стеж за своїми рослинами, не забувай поливати, читай поради спільноти
          </p>
          <div className="hero-actions">
            <Link to="/herbarium" className="btn btn-primary">start</Link>
            <Link to="/catalog" className="btn btn-ghost">catalog</Link>
          </div>
        </div>
        <figure className="hero-figure">
          <img src="/images/hero.jpg" alt="зелений куточок з рослинами" />
          <figcaption>догляд за рослинами вдома</figcaption>
        </figure>
      </section>

      <section className="info" id="info">
        <article className="info-block">
          <h2>як це працює</h2>
          <ol>
            <li>зареєструйся</li>
            <li>додай свої рослини</li>
            <li>отримуй нагадування</li>
            <li>ділись досвідом</li>
          </ol>
        </article>
        <article className="info-block">
          <h2>чому plant-care-hub</h2>
          <ul>
            <li>нагадування про полив</li>
            <li>каталог 10000+ видів</li>
            <li>поради від користувачів</li>
            <li>погода у твоєму місті</li>
          </ul>
        </article>
      </section>

      <section className="video-section" id="video">
        <h2>догляд за домашніми рослинами</h2>
        <div className="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="догляд за рослинами"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <section className="latest-tips" id="tips">
        <h2>останні поради спільноти</h2>
        {!tips && !error && <Loader label="завантаження порад…" />}
        {error && <div className="error-block">не вдалось завантажити поради: {error}</div>}
        {tips && (
          <div className="tips-grid">
            {tips.map((t) => (
              <article className="tip-card" key={t.id}>
                <img src={t.image || '/images/tip1.jpg'} alt={t.title} />
                <h3>{t.title}</h3>
                <p>{t.body}</p>
                <span className="author">{t.author}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
