import type { LayerToggles } from '../astro/types';

interface LayerControlsProps {
  toggles: LayerToggles;
  onToggle: (key: keyof LayerToggles, value: boolean) => void;
  onExport: () => void;
  onSave: () => void;
}

export default function LayerControls({ toggles, onToggle, onExport, onSave }: LayerControlsProps) {
  const entries: Array<{ key: keyof LayerToggles; label: string }> = [
    { key: 'planets', label: 'Planetas clásicos' },
    { key: 'asteroids', label: 'Asteroides y puntos especiales' },
    { key: 'centaurs', label: 'Centauros / cometas' },
    { key: 'sensitivePoints', label: 'Puntos sensibles' },
    { key: 'houses', label: 'Casas astrológicas' },
    { key: 'aspects', label: 'Aspectos planetarios' },
    { key: 'dodecatemorias', label: 'Dodecatemorias' },
    { key: 'labels', label: 'Etiquetas y símbolos' }
  ];

  return (
    <div className="layer-toolbar">
      <h3>Capas de visualización</h3>
      <div className="toggle-grid">
        {entries.map(({ key, label }) => (
          <label key={key} className="toggle-row">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={toggles[key]}
              onChange={(event) => onToggle(key, event.target.checked)}
            />
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={onSave}>
          Guardar perfil
        </button>
        <button type="button" className="secondary" onClick={onExport}>
          Exportar imagen
        </button>
      </div>
    </div>
  );
}
