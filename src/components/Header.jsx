export default function Header({ info }) {
  const cls = info.loading ? 'loading' : info.espnOk === false ? 'error' : '';
  const msg = info.loading
    ? 'Fetching scores…'
    : `Updated ${info.lastUpdated?.toLocaleTimeString()} · ${info.count} scores cached · auto-refresh 5 min`;
  return (
    <div className="header">
      <h1>⚽ WC 2026 · <em>Beylikdüzü</em> Predictions</h1>
      <p>USA · Canada · Mexico · June–July 2026</p>
      <div className="refresh-row">
        <span className={`rdot ${cls}`}/>
        <span>{msg}</span>
      </div>
    </div>
  );
}
