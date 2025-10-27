import type { CelestialBody } from './types';

export const BASE_BODIES: CelestialBody[] = [
  { id: 'sun', name: 'Sol', symbol: '☉', category: 'planeta', color: '#ffd369' },
  { id: 'moon', name: 'Luna', symbol: '☽', category: 'planeta', color: '#f8f5ff' },
  { id: 'mercury', name: 'Mercurio', symbol: '☿', category: 'planeta', color: '#cfd2f5' },
  { id: 'venus', name: 'Venus', symbol: '♀', category: 'planeta', color: '#f5b6d4' },
  { id: 'mars', name: 'Marte', symbol: '♂', category: 'planeta', color: '#ff6b6b' },
  { id: 'jupiter', name: 'Júpiter', symbol: '♃', category: 'planeta', color: '#f5d08a' },
  { id: 'saturn', name: 'Saturno', symbol: '♄', category: 'planeta', color: '#b4b2d0' },
  { id: 'uranus', name: 'Urano', symbol: '♅', category: 'planeta', color: '#87ebff' },
  { id: 'neptune', name: 'Neptuno', symbol: '♆', category: 'planeta', color: '#6fc0ff' },
  { id: 'pluto', name: 'Plutón', symbol: '♇', category: 'planeta', color: '#c185ff' },
  { id: 'ceres', name: 'Ceres', symbol: '⚳', category: 'asteroide', color: '#b3f6c3' },
  { id: 'pallas', name: 'Palas', symbol: '⚴', category: 'asteroide', color: '#f9dc5c' },
  { id: 'juno', name: 'Juno', symbol: '⚵', category: 'asteroide', color: '#ffa69e' },
  { id: 'vesta', name: 'Vesta', symbol: '⚶', category: 'asteroide', color: '#ffd3b6' },
  { id: 'chiron', name: 'Quirón', symbol: '⚷', category: 'centauro', color: '#8ac6d0' },
  { id: 'pholus', name: 'Folo', symbol: 'Ph', category: 'centauro', color: '#94b3fd' },
  { id: 'lilith', name: 'Lilith', symbol: '⚸', category: 'punto', color: '#d8b4f8' },
  { id: 'fortune', name: 'Parte de la Fortuna', symbol: '⊗', category: 'punto', color: '#b8ffd9' },
  { id: 'vertex', name: 'Vértice', symbol: 'Vx', category: 'punto', color: '#f472b6' },
  { id: 'fama', name: 'Fama (408)', symbol: 'Fa', category: 'asteroide', color: '#ffd700' },
  { id: 'aura', name: 'Aura (1488)', symbol: 'Au', category: 'asteroide', color: '#d0e2ff' },
  { id: 'rockefellia', name: 'Rockefellia (904)', symbol: 'Rf', category: 'asteroide', color: '#a7f3d0' }
];

export const SIGN_LABELS = [
  'Aries',
  'Tauro',
  'Géminis',
  'Cáncer',
  'Leo',
  'Virgo',
  'Libra',
  'Escorpio',
  'Sagitario',
  'Capricornio',
  'Acuario',
  'Piscis'
] as const;

export const ASPECTS = [
  { kind: 'Conjunción', angle: 0, orb: 8 },
  { kind: 'Oposición', angle: 180, orb: 8 },
  { kind: 'Trígono', angle: 120, orb: 7 },
  { kind: 'Cuadratura', angle: 90, orb: 6 },
  { kind: 'Sextil', angle: 60, orb: 4 },
  { kind: 'Quincuncio', angle: 150, orb: 3 }
] as const;

export const DEGREE_PER_SIGN = 30;
