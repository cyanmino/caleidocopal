import type { FormEvent } from 'react';
import type { NatalInput } from '../astro/types';

interface NatalFormProps {
  input: NatalInput;
  onChange: (partial: Partial<NatalInput>) => void;
  onSubmit: () => void;
}

export default function NatalForm({ input, onChange, onSubmit }: NatalFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="name">Nombre del perfil</label>
        <input
          id="name"
          name="name"
          value={input.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Ej. Carta de Ana"
        />
      </div>

      <div className="form-row">
        <label htmlFor="date">Fecha de nacimiento</label>
        <input
          id="date"
          name="date"
          type="date"
          value={input.date}
          onChange={(event) => onChange({ date: event.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="time">Hora exacta</label>
        <input
          id="time"
          name="time"
          type="time"
          value={input.time}
          onChange={(event) => onChange({ time: event.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="timezone">Zona horaria (±HH:MM)</label>
        <input
          id="timezone"
          name="timezone"
          pattern="[+-]\\d{2}:\\d{2}"
          value={input.timezone}
          onChange={(event) => onChange({ timezone: event.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="latitude">Latitud</label>
        <input
          id="latitude"
          name="latitude"
          type="number"
          step="0.0001"
          value={input.latitude}
          onChange={(event) => onChange({ latitude: Number(event.target.value) })}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="longitude">Longitud</label>
        <input
          id="longitude"
          name="longitude"
          type="number"
          step="0.0001"
          value={input.longitude}
          onChange={(event) => onChange({ longitude: Number(event.target.value) })}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="houseSystem">Sistema de casas</label>
        <select
          id="houseSystem"
          name="houseSystem"
          value={input.houseSystem}
          onChange={(event) => onChange({ houseSystem: event.target.value as NatalInput['houseSystem'] })}
        >
          <option value="Placidus">Placidus</option>
          <option value="Koch">Koch</option>
          <option value="Iguales">Iguales</option>
        </select>
      </div>

      <button type="submit">Calcular carta</button>
    </form>
  );
}
