import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ChartData, ChartRuntimeState } from '../astro/types';

const ASPECT_COLORS: Record<string, number> = {
  Conjunción: 0xffffff,
  Oposición: 0xffa8a8,
  Trígono: 0x7cfcff,
  Cuadratura: 0xff6b6b,
  Sextil: 0x9ae6b4,
  Quincuncio: 0xfed7aa
};

interface ChartCanvasProps {
  chart: ChartData;
  runtime: ChartRuntimeState;
  onSelectBody: (id?: string) => void;
  onSelectAspect: (id?: string) => void;
}

interface LabeledObject extends THREE.Object3D {
  userData: {
    type: 'body' | 'aspect';
    id: string;
  };
}

function createLabelSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas para etiquetas');
  }
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(15, 15, 24, 0.85)';
  ctx.beginPath();
  if ('roundRect' in ctx) {
    (ctx as CanvasRenderingContext2D & { roundRect: typeof ctx.roundRect }).roundRect(28, 90, 200, 76, 38);
  } else {
    ctx.rect(28, 90, 200, 76);
  }
  ctx.fill();
  ctx.font = 'bold 72px Inter, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(16, 16, 1);
  return sprite;
}

function polarToCartesian(longitude: number, radius: number): THREE.Vector3 {
  const angle = THREE.MathUtils.degToRad(longitude - 90);
  return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

const ChartCanvas = forwardRef<HTMLCanvasElement, ChartCanvasProps>(
  ({ chart, runtime, onSelectAspect, onSelectBody }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const chartGroupRef = useRef<THREE.Group | null>(null);
    const interactionBodies = useRef<LabeledObject[]>([]);
    const interactionAspects = useRef<LabeledObject[]>([]);
    const frameRef = useRef<number>();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointer = useMemo(() => new THREE.Vector2(), []);

    useImperativeHandle(ref, () => rendererRef.current?.domElement ?? null);

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }
      const width = containerRef.current.clientWidth || 600;
      const height = containerRef.current.clientHeight || width;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05050c);
      scene.fog = new THREE.Fog(0x05050c, 320, 520);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 140, 220);
      cameraRef.current = camera;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 120;
      controls.maxDistance = 360;
      controls.maxPolarAngle = Math.PI * 0.75;
      controlsRef.current = controls;

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const directional = new THREE.DirectionalLight(0xffffff, 0.75);
      directional.position.set(120, 180, 120);
      scene.add(directional);

      const chartGroup = new THREE.Group();
      scene.add(chartGroup);
      chartGroupRef.current = chartGroup;

      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        frameRef.current = requestAnimationFrame(animate);
      };
      animate();

      const resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver((entries) => {
              for (const entry of entries) {
                if (entry.target === containerRef.current) {
                  const { width: nextWidth, height: nextHeight } = entry.contentRect;
                  renderer.setSize(nextWidth, nextHeight);
                  camera.aspect = nextWidth / nextHeight;
                  camera.updateProjectionMatrix();
                }
              }
            })
          : undefined;
      resizeObserver?.observe(containerRef.current);
      const handleWindowResize = () => {
        if (!containerRef.current) return;
        const { clientWidth: nextWidth, clientHeight: nextHeight } = containerRef.current;
        renderer.setSize(nextWidth, nextHeight);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
      };
      if (!resizeObserver) {
        window.addEventListener('resize', handleWindowResize);
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (!rendererRef.current || !cameraRef.current) {
          return;
        }
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, cameraRef.current);
        const targets = [...interactionBodies.current, ...interactionAspects.current];
        const intersects = raycaster.intersectObjects(targets, false);
        if (intersects.length > 0) {
          const { type, id } = intersects[0].object.userData as LabeledObject['userData'];
          if (type === 'body') {
            onSelectBody(id);
            onSelectAspect(undefined);
          } else {
            onSelectAspect(id);
            onSelectBody(undefined);
          }
        } else {
          onSelectBody(undefined);
          onSelectAspect(undefined);
        }
      };

      renderer.domElement.addEventListener('pointerdown', handlePointerDown);

      return () => {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        resizeObserver?.disconnect();
        if (!resizeObserver) {
          window.removeEventListener('resize', handleWindowResize);
        }
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        controls.dispose();
        renderer.dispose();
        scene.clear();
        containerRef.current?.removeChild(renderer.domElement);
      };
    }, [onSelectAspect, onSelectBody, pointer, raycaster]);

    useEffect(() => {
      const chartGroup = chartGroupRef.current;
      if (!chartGroup || !rendererRef.current) {
        return;
      }
      chartGroup.clear();
      interactionBodies.current = [];
      interactionAspects.current = [];

      const baseRingGeometry = new THREE.RingGeometry(82, 102, 128);
      const baseRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x1c1f3b,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const baseRing = new THREE.Mesh(baseRingGeometry, baseRingMaterial);
      baseRing.rotation.x = -Math.PI / 2;
      chartGroup.add(baseRing);

      const signRingGeometry = new THREE.RingGeometry(102, 108, 12, 1, 0, Math.PI * 2);
      const signRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x343a6e,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const signRing = new THREE.Mesh(signRingGeometry, signRingMaterial);
      signRing.rotation.x = -Math.PI / 2;
      chartGroup.add(signRing);

      // Houses
      if (runtime.toggles.houses) {
        for (const cusp of chart.houses) {
          const start = new THREE.Vector3();
          const end = polarToCartesian(cusp.longitude, 108);
          const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
          const material = new THREE.LineBasicMaterial({ color: 0x4f56a5, transparent: true, opacity: 0.5 });
          const line = new THREE.Line(geometry, material) as LabeledObject;
          line.rotation.x = -Math.PI / 2;
          chartGroup.add(line);
        }
      }

      // Zodiac labels
      if (runtime.toggles.labels) {
        chart.houses.slice(0, 12).forEach((cusp, index) => {
          if (index >= 12) return;
          const position = polarToCartesian(cusp.longitude + 15, 114);
          const label = createLabelSprite(cusp.sign.slice(0, 3).toUpperCase(), '#dbeafe');
          label.position.copy(position);
          label.position.y = 2;
          chartGroup.add(label);
        });
      }

      const radiusMap: Record<string, number> = {
        planeta: 96,
        asteroide: 100,
        centauro: 94,
        punto: 90
      };

      const geometry = new THREE.SphereGeometry(2.6, 24, 24);

      for (const body of chart.bodies) {
        const showBody =
          (body.category === 'planeta' && runtime.toggles.planets) ||
          (body.category === 'asteroide' && runtime.toggles.asteroids) ||
          (body.category === 'centauro' && runtime.toggles.centaurs) ||
          (body.category === 'punto' && runtime.toggles.sensitivePoints);
        if (!showBody) continue;

        const radius = radiusMap[body.category] ?? 96;
        const position = polarToCartesian(body.position.longitude, radius);
        const material = new THREE.MeshStandardMaterial({
          color: body.color,
          emissive: runtime.selectedBodyId === body.id ? 0xffffff : 0x0,
          emissiveIntensity: runtime.selectedBodyId === body.id ? 0.8 : 0.1,
          metalness: 0.3,
          roughness: 0.25
        });
        const mesh = new THREE.Mesh(geometry, material) as LabeledObject;
        mesh.position.copy(position);
        mesh.position.y = body.category === 'punto' ? 4 : 2;
        mesh.userData = { type: 'body', id: body.id };
        chartGroup.add(mesh);
        interactionBodies.current.push(mesh);

        if (runtime.toggles.labels) {
          const label = createLabelSprite(body.symbol, '#f8fafc');
          label.position.copy(position);
          label.position.y += body.category === 'punto' ? 8 : 6;
          chartGroup.add(label);
        }

        if (runtime.toggles.dodecatemorias) {
          const dodeLabel = createLabelSprite(body.position.dodecatemoria.slice(0, 3).toUpperCase(), '#f9a8d4');
          dodeLabel.position.copy(position);
          dodeLabel.position.y += 12;
          chartGroup.add(dodeLabel);
        }
      }

      if (runtime.toggles.aspects) {
        const visibleBodies = new Set(interactionBodies.current.map((object) => object.userData.id));
        for (const aspect of chart.aspects) {
          if (!visibleBodies.has(aspect.from.id) || !visibleBodies.has(aspect.to.id)) {
            continue;
          }
          const start = polarToCartesian(aspect.from.position.longitude, radiusMap[aspect.from.category] ?? 96);
          const end = polarToCartesian(aspect.to.position.longitude, radiusMap[aspect.to.category] ?? 96);
          const mid = start.clone().add(end).multiplyScalar(0.5);
          mid.y += 30;
          const curve = new THREE.CatmullRomCurve3([start, mid, end]);
          const points = curve.getPoints(48);
          const geometryCurve = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: ASPECT_COLORS[aspect.kind] ?? 0xffffff,
            transparent: true,
            opacity: runtime.selectedAspectId === aspect.id ? 0.95 : 0.4
          });
          const line = new THREE.Line(geometryCurve, material) as LabeledObject;
          line.userData = { type: 'aspect', id: aspect.id };
          chartGroup.add(line);
          interactionAspects.current.push(line);
        }
      }
    }, [chart, runtime]);

    return <div ref={containerRef} className="canvas-container" />;
  }
);

ChartCanvas.displayName = 'ChartCanvas';

export default ChartCanvas;
