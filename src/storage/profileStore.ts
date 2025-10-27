import { create } from 'zustand';
import { createProfileFromInput, defaultNatalInput } from '../astro/calculations';
import type { NatalInput, ProfileRecord } from '../astro/types';

const STORAGE_KEY = 'caleidocopal.profiles.v1';

interface ProfileStoreState {
  profiles: ProfileRecord[];
  currentProfileId?: string;
  upsertProfile: (profile: ProfileRecord) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (id: string) => void;
}

interface PersistedState {
  profiles: ProfileRecord[];
  currentProfileId?: string;
}

function readFromStorage(): PersistedState {
  if (typeof window === 'undefined') {
    return { profiles: [createProfileFromInput(defaultNatalInput())] };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { profiles: [createProfileFromInput(defaultNatalInput())] };
  }
  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return { profiles: [createProfileFromInput(defaultNatalInput())] };
    }
    return parsed;
  } catch (error) {
    console.warn('No se pudo leer el almacenamiento local:', error);
    return { profiles: [createProfileFromInput(defaultNatalInput())] };
  }
}

function persist(state: PersistedState): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useProfileStore = create<ProfileStoreState>((set, get) => {
  const initial = readFromStorage();

  return {
    profiles: initial.profiles,
    currentProfileId: initial.currentProfileId ?? initial.profiles[0]?.id,
    upsertProfile: (profile) => {
      set((state) => {
        const existingIndex = state.profiles.findIndex((item) => item.id === profile.id);
        const profiles = [...state.profiles];
        if (existingIndex >= 0) {
          profiles[existingIndex] = profile;
        } else {
          profiles.push(profile);
        }
        const currentProfileId = get().currentProfileId ?? profile.id;
        const nextState: PersistedState = {
          profiles,
          currentProfileId
        };
        persist(nextState);
        return {
          profiles,
          currentProfileId
        };
      });
    },
    deleteProfile: (id) => {
      set((state) => {
        const profiles = state.profiles.filter((profile) => profile.id !== id);
        const nextState: PersistedState = {
          profiles,
          currentProfileId: get().currentProfileId === id ? profiles[0]?.id : get().currentProfileId
        };
        persist(nextState);
        return {
          profiles,
          currentProfileId: nextState.currentProfileId
        };
      });
    },
    setCurrentProfile: (id) => {
      set(() => {
        const nextState: PersistedState = {
          profiles: get().profiles,
          currentProfileId: id
        };
        persist(nextState);
        return {
          currentProfileId: id
        };
      });
    }
  };
});

export function resetProfilesForTests(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  useProfileStore.setState({
    profiles: [createProfileFromInput(defaultNatalInput())],
    currentProfileId: undefined
  });
}

export function createProfile(input: NatalInput): ProfileRecord {
  return createProfileFromInput(input);
}
