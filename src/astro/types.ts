export type ZodiacSign =
  | 'Aries'
  | 'Tauro'
  | 'Géminis'
  | 'Cáncer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Escorpio'
  | 'Sagitario'
  | 'Capricornio'
  | 'Acuario'
  | 'Piscis';

export type CelestialCategory =
  | 'planeta'
  | 'asteroide'
  | 'centauro'
  | 'punto'
  | 'casa';

export interface CelestialBody {
  id: string;
  name: string;
  symbol: string;
  category: CelestialCategory;
  color: string;
}

export interface BodyPosition {
  longitude: number; // grados eclípticos 0-360
  latitude: number; // grados eclípticos -90-90
  sign: ZodiacSign;
  signDegree: number;
  minutes: number;
  dodecatemoria: ZodiacSign;
  house: number;
}

export interface ChartBody extends CelestialBody {
  position: BodyPosition;
  retrograde?: boolean;
}

export type AspectKind =
  | 'Conjunción'
  | 'Oposición'
  | 'Trígono'
  | 'Cuadratura'
  | 'Sextil'
  | 'Quincuncio';

export interface Aspect {
  id: string;
  kind: AspectKind;
  from: ChartBody;
  to: ChartBody;
  exactAngle: number;
  orb: number;
}

export interface HouseCusp {
  index: number; // 1-12
  longitude: number;
  sign: ZodiacSign;
  signDegree: number;
  minutes: number;
}

export interface ChartMetadata {
  julianDay: number;
  timezoneOffsetMinutes: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ChartData {
  metadata: ChartMetadata;
  bodies: ChartBody[];
  houses: HouseCusp[];
  aspects: Aspect[];
}

export interface NatalInput {
  name: string;
  date: string; // ISO date string
  time: string; // HH:mm
  timezone: string; // offset like +02:00
  latitude: number;
  longitude: number;
  houseSystem: 'Placidus' | 'Koch' | 'Iguales';
}

export interface LayerToggles {
  planets: boolean;
  asteroids: boolean;
  centaurs: boolean;
  sensitivePoints: boolean;
  houses: boolean;
  aspects: boolean;
  dodecatemorias: boolean;
  labels: boolean;
}

export interface ChartRuntimeState {
  selectedBodyId?: string;
  selectedAspectId?: string;
  toggles: LayerToggles;
}

export interface ProfileRecord {
  id: string;
  label: string;
  input: NatalInput;
  createdAt: string;
}
