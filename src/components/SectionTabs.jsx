export default function SectionTabs({ sections, active, onChange }) {
  return (
    <div className="tabs">
      {sections.map(s => (
        <button
          key={s}
          className={`tab-btn${s === active ? ' active' : ''}`}
          onClick={() => onChange(s)}
        >
          {s === 'all' ? 'All' : s}
        </button>
      ))}
    </div>
  );
}
