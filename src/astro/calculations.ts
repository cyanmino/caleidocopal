import { BASE_BODIES, ASPECTS } from './constants';
import {
  type Aspect,
  type ChartBody,
  type ChartData,
  type HouseCusp,
  type NatalInput,
  type ProfileRecord,
  type ZodiacSign
} from './types';
import {
  angleDifference,
  computeDodecatemoria,
  getDegreeWithinSign,
  getSignFromLongitude,
  normalizeDegrees
} from './math';

const J2000 = 2451545.0;

const ORBITAL_RATES: Record<string, { base: number; rate: number }> = {
  sun: { base: 280.46, rate: 0.98564736 },
  moon: { base: 218.316, rate: 13.176358 },
  mercury: { base: 60.750, rate: 4.092356 },
  venus: { base: 88.307, rate: 1.602130 },
  mars: { base: 181.9798, rate: 0.52402068 },
  jupiter: { base: 34.404, rate: 0.08308529 },
  saturn: { base: 50.077, rate: 0.03344414 },
  uranus: { base: 314.055, rate: 0.01168998 },
  neptune: { base: 304.348, rate: 0.00598103 },
  pluto: { base: 238.929, rate: 0.003964015 },
  ceres: { base: 130.743, rate: 0.2141 },
  pallas: { base: 56.4, rate: 0.2603 },
  juno: { base: 245.642, rate: 0.2801 },
  vesta: { base: 119.182, rate: 0.3234 },
  chiron: { base: 209.5, rate: 0.0172 },
  pholus: { base: 150.3, rate: 0.0415 },
  fama: { base: 93.1, rate: 0.2379 },
  aura: { base: 12.7, rate: 0.1843 },
  rockefellia: { base: 333.6, rate: 0.1987 }
};

function parseTimezoneOffset(value: string): number {
  const match = value.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) {
    return 0;
  }
  const [, sign, hh, mm] = match;
  const minutes = parseInt(hh, 10) * 60 + parseInt(mm, 10);
  return sign === '-' ? -minutes : minutes;
}

function toJulianDay(input: NatalInput): number {
  const timezoneMinutes = parseTimezoneOffset(input.timezone);
  const date = new Date(`${input.date}T${input.time}:00${input.timezone}`);
  const utcMillis = date.getTime() - timezoneMinutes * 60_000;
  return utcMillis / 86400000 + 2440587.5;
}

function computeLocalSidereal(julianDay: number, longitude: number): number {
  const T = (julianDay - J2000) / 36525;
  const theta =
    280.46061837 +
    360.98564736629 * (julianDay - J2000) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalizeDegrees(theta + longitude);
}

function buildHouses(ascendant: number): HouseCusp[] {
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const longitude = normalizeDegrees(ascendant + i * 30);
    const sign = getSignFromLongitude(longitude);
    const degreeWithin = getDegreeWithinSign(longitude);
    const signDegree = Math.floor(degreeWithin);
    const minutes = Math.round((degreeWithin - signDegree) * 60);
    houses.push({
      index: i + 1,
      longitude,
      sign,
      signDegree,
      minutes
    });
  }
  return houses;
}

function assignHouse(longitude: number, houses: HouseCusp[]): number {
  const value = normalizeDegrees(longitude);
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].longitude;
    const end = houses[(i + 1) % houses.length].longitude;
    if (start <= end) {
      if (value >= start && value < end) {
        return houses[i].index;
      }
    } else {
      if (value >= start || value < end) {
        return houses[i].index;
      }
    }
  }
  return 12;
}

function computeLongitude(bodyId: string, julianDay: number): number {
  if (bodyId === 'lilith' || bodyId === 'fortune' || bodyId === 'vertex') {
    throw new Error('Synthetic points require context');
  }
  const orbit = ORBITAL_RATES[bodyId];
  if (!orbit) {
    // fallback: reuse Jupiter's rhythm as a slow mover
    const fallback = ORBITAL_RATES.jupiter;
    const days = julianDay - J2000;
    return normalizeDegrees(fallback.base + fallback.rate * days);
  }
  const days = julianDay - J2000;
  return normalizeDegrees(orbit.base + orbit.rate * days);
}

function resolveSyntheticPoint(
  bodyId: string,
  julianDay: number,
  houses: HouseCusp[],
  bodyMap: Map<string, number>
): number {
  if (bodyId === 'lilith') {
    const moon = bodyMap.get('moon') ?? computeLongitude('moon', julianDay);
    return normalizeDegrees(moon + 180);
  }
  if (bodyId === 'fortune') {
    const sun = bodyMap.get('sun') ?? computeLongitude('sun', julianDay);
    const moon = bodyMap.get('moon') ?? computeLongitude('moon', julianDay);
    const asc = houses[0]?.longitude ?? 0;
    return normalizeDegrees(asc + moon - sun);
  }
  if (bodyId === 'vertex') {
    const mc = houses[9]?.longitude ?? 0;
    return normalizeDegrees(mc + 90);
  }
  return 0;
}

function detectAspects(bodies: ChartBody[]): Aspect[] {
  const aspects: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const from = bodies[i];
      const to = bodies[j];
      const diff = angleDifference(from.position.longitude, to.position.longitude);
      for (const aspectDef of ASPECTS) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= aspectDef.orb) {
          aspects.push({
            id: `${aspectDef.kind}-${from.id}-${to.id}`,
            kind: aspectDef.kind,
            from,
            to,
            exactAngle: diff,
            orb
          });
        }
      }
    }
  }
  return aspects;
}

function computeRetrograde(bodyId: string, julianDay: number, longitude: number): boolean {
  if (bodyId === 'sun' || bodyId === 'moon' || bodyId === 'fortune' || bodyId === 'vertex') {
    return false;
  }
  const prev = computeLongitude(bodyId, julianDay - 1);
  const delta = normalizeDegrees(longitude - prev);
  return delta > 180;
}

export function calculateChart(input: NatalInput): ChartData {
  const julianDay = toJulianDay(input);
  const timezoneMinutes = parseTimezoneOffset(input.timezone);
  const ascendant = computeLocalSidereal(julianDay, input.longitude);
  const houses = buildHouses(ascendant);

  const bodyLongitudes = new Map<string, number>();

  const bodies: ChartBody[] = BASE_BODIES.map((body) => {
    let longitude: number;
    if (body.category === 'punto' && (body.id === 'fortune' || body.id === 'vertex' || body.id === 'lilith')) {
      longitude = resolveSyntheticPoint(body.id, julianDay, houses, bodyLongitudes);
    } else {
      longitude = computeLongitude(body.id, julianDay);
    }
    bodyLongitudes.set(body.id, longitude);
    const sign = getSignFromLongitude(longitude);
    const degreeWithin = getDegreeWithinSign(longitude);
    const signDegree = Math.floor(degreeWithin);
    const minutes = Math.round((degreeWithin - signDegree) * 60);
    const dodecatemoria = computeDodecatemoria(sign as ZodiacSign, degreeWithin);
    const house = assignHouse(longitude, houses);
    const retrograde = computeRetrograde(body.id, julianDay, longitude);
    return {
      ...body,
      position: {
        longitude,
        latitude: 0,
        sign,
        signDegree,
        minutes,
        dodecatemoria,
        house
      },
      retrograde
    };
  });

  const aspects = detectAspects(bodies);

  return {
    metadata: {
      julianDay,
      timezoneOffsetMinutes: timezoneMinutes,
      location: {
        latitude: input.latitude,
        longitude: input.longitude
      }
    },
    bodies,
    houses,
    aspects
  };
}

export function defaultNatalInput(): NatalInput {
  return {
    name: 'Carta de Ejemplo',
    date: '1990-06-15',
    time: '08:15',
    timezone: '-03:00',
    latitude: -34.6037,
    longitude: -58.3816,
    houseSystem: 'Iguales'
  };
}

export function createProfileFromInput(input: NatalInput): ProfileRecord {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    label: input.name || 'Perfil sin nombre',
    input,
    createdAt: new Date().toISOString()
  };
}
