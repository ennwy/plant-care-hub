import { Component } from 'react';
import Loader from './Loader.jsx';

const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

export default class WeatherWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: props.defaultCity || 'Kyiv',
      cityInput: props.defaultCity || 'Kyiv',
      data: null,
      loading: false,
      error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.fetchWeather(this.state.city);
  }

  async fetchWeather(city) {
    const key = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!key) {
      this.setState({ error: 'не задано VITE_OPENWEATHER_KEY у .env', loading: false });
      return;
    }
    this.setState({ loading: true, error: null });
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ua&appid=${key}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const msg = res.status === 404 ? `місто "${city}" не знайдено` : `помилка ${res.status}`;
        throw new Error(msg);
      }
      const data = await res.json();
      this.setState({ data, loading: false });
    } catch (err) {
      this.setState({
        error: err.name === 'AbortError' ? 'таймаут запиту до openweather' : err.message,
        loading: false,
      });
    }
  }

  onChange(e) {
    this.setState({ cityInput: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    const city = this.state.cityInput.trim();
    if (!city) return;
    this.setState({ city });
    this.fetchWeather(city);
  }

  render() {
    const { data, loading, error, cityInput } = this.state;
    return (
      <section className="weather-widget" aria-label="погода">
        {loading && <Loader label="погода…" />}
        {!loading && error && (
          <div className="weather-main">
            <h3>погода</h3>
            <p className="weather-error">{error}</p>
          </div>
        )}
        {!loading && !error && data && (
          <>
            <img
              className="weather-icon"
              src={ICON_URL(data.weather?.[0]?.icon || '01d')}
              alt={data.weather?.[0]?.description || 'погода'}
            />
            <div className="weather-main">
              <h3>{data.name}</h3>
              <div className="weather-temp">{Math.round(data.main.temp)}°C</div>
              <div className="weather-desc">{data.weather?.[0]?.description}</div>
              <div className="weather-meta">
                <span>відчувається {Math.round(data.main.feels_like)}°C</span>
                <span>вологість {data.main.humidity}%</span>
                <span>вітер {Math.round(data.wind.speed)} м/с</span>
              </div>
            </div>
          </>
        )}
        <form className="weather-city-form" onSubmit={this.onSubmit}>
          <input
            type="text"
            value={cityInput}
            onChange={this.onChange}
            placeholder="інше місто"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            оновити
          </button>
        </form>
      </section>
    );
  }
}
