import { useCallback, useRef } from 'react';
import ChartCanvas from './components/ChartCanvas';
import InfoPanel from './components/InfoPanel';
import LayerControls from './components/LayerControls';
import NatalForm from './components/NatalForm';
import ProfileList from './components/ProfileList';
import { exportCanvasImage } from './utils/export';
import { useChartData } from './hooks/useChartData';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    chart,
    input,
    runtime,
    profiles,
    currentProfile,
    updateInput,
    recalculate,
    toggleLayer,
    selectBody,
    selectAspect,
    saveProfile,
    loadProfile,
    removeProfile
  } = useChartData();

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) {
      return;
    }
    await exportCanvasImage(canvasRef.current, `${input.name || 'carta'}-3d.png`);
  }, [input.name]);

  return (
    <>
      <header>
        <h1>Caleidocopal</h1>
        <p>
          Carta astral tridimensional offline. Calcula posiciones planetarias, casas, aspectos y capas
          adicionales como dodecatemorias, asteroides y puntos sensibles. Explora tu mandala natal en 3D
          sin conexión.
        </p>
      </header>
      <main>
        <section className="panel" style={{ display: 'grid', gap: '1.25rem' }}>
          <ChartCanvas
            ref={canvasRef}
            chart={chart}
            runtime={runtime}
            onSelectAspect={selectAspect}
            onSelectBody={selectBody}
          />
          <InfoPanel chart={chart} runtime={runtime} />
        </section>
        <aside className="panel" style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
          <div>
            <h2>Datos natales</h2>
            <NatalForm input={input} onChange={updateInput} onSubmit={recalculate} />
          </div>
          <LayerControls toggles={runtime.toggles} onToggle={toggleLayer} onExport={handleExport} onSave={saveProfile} />
          <div>
            <h2>Perfiles guardados</h2>
            <ProfileList
              profiles={profiles}
              currentId={currentProfile?.id}
              onSelect={loadProfile}
              onDelete={removeProfile}
            />
          </div>
        </aside>
      </main>
      <footer>
        Proyecto prototipo · Algoritmos astronómicos simplificados con fines de exploración interactiva.
      </footer>
    </>
  );
}
