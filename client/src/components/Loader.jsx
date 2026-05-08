export default function Loader({ label = 'завантаження…' }) {
  return (
    <div className="loader-block" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
