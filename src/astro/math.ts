import { DEGREE_PER_SIGN, SIGN_LABELS } from './constants';
import type { ZodiacSign } from './types';

export function normalizeDegrees(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

export function getSignFromLongitude(longitude: number): ZodiacSign {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / DEGREE_PER_SIGN) % SIGN_LABELS.length;
  return SIGN_LABELS[index];
}

export function getDegreeWithinSign(longitude: number): number {
  const normalized = normalizeDegrees(longitude);
  return normalized % DEGREE_PER_SIGN;
}

export function computeDodecatemoria(sign: ZodiacSign, degreeWithinSign: number): ZodiacSign {
  const signIndex = SIGN_LABELS.indexOf(sign as any);
  const dodecatemoriaIndex = Math.floor((degreeWithinSign / DEGREE_PER_SIGN) * 12);
  const absoluteIndex = (signIndex * 12 + dodecatemoriaIndex) % SIGN_LABELS.length;
  return SIGN_LABELS[absoluteIndex];
}

export function angleDifference(a: number, b: number): number {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return diff > 180 ? 360 - diff : diff;
}
