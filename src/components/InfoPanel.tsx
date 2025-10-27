import type { ChartData, ChartRuntimeState } from '../astro/types';

interface InfoPanelProps {
  chart: ChartData;
  runtime: ChartRuntimeState;
}

function formatDegree(degree: number, minutes: number): string {
  return `${degree.toString().padStart(2, '0')}°${minutes.toString().padStart(2, '0')}`;
}

export default function InfoPanel({ chart, runtime }: InfoPanelProps) {
  const selectedBody = runtime.selectedBodyId
    ? chart.bodies.find((body) => body.id === runtime.selectedBodyId)
    : undefined;

  const selectedAspect = runtime.selectedAspectId
    ? chart.aspects.find((aspect) => aspect.id === runtime.selectedAspectId)
    : undefined;

  return (
    <div className="info-panel">
      <div className="info-block">
        <h3>Resumen astronómico</h3>
        <ul className="info-list">
          <li>JD: {chart.metadata.julianDay.toFixed(3)}</li>
          <li>
            Latitud: {chart.metadata.location.latitude.toFixed(4)} · Longitud:{' '}
            {chart.metadata.location.longitude.toFixed(4)}
          </li>
          <li>Zona horaria: {chart.metadata.timezoneOffsetMinutes / 60} h</li>
        </ul>
      </div>

      {selectedBody && (
        <div className="info-block">
          <h3>Objeto seleccionado</h3>
          <ul className="info-list">
            <li>{selectedBody.name}</li>
            <li>
              Posición: {selectedBody.position.sign} {formatDegree(selectedBody.position.signDegree, selectedBody.position.minutes)}
            </li>
            <li>Casa: {selectedBody.position.house}</li>
            <li>Dodecatemoria: {selectedBody.position.dodecatemoria}</li>
            <li>Movimiento: {selectedBody.retrograde ? 'Retrógrado' : 'Directo'}</li>
          </ul>
        </div>
      )}

      {selectedAspect && (
        <div className="info-block">
          <h3>Aspecto seleccionado</h3>
          <ul className="info-list">
            <li>
              {selectedAspect.kind} · {selectedAspect.from.name} / {selectedAspect.to.name}
            </li>
            <li>Ángulo: {selectedAspect.exactAngle.toFixed(2)}°</li>
            <li>Orbe: {selectedAspect.orb.toFixed(2)}°</li>
          </ul>
        </div>
      )}
    </div>
  );
}
