import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  calculateChart,
  createProfileFromInput,
  defaultNatalInput
} from '../astro/calculations';
import type {
  ChartData,
  ChartRuntimeState,
  LayerToggles,
  NatalInput,
  ProfileRecord
} from '../astro/types';
import { useProfileStore } from '../storage/profileStore';

const INITIAL_TOGGLES: LayerToggles = {
  planets: true,
  asteroids: true,
  centaurs: true,
  sensitivePoints: true,
  houses: true,
  aspects: true,
  dodecatemorias: false,
  labels: true
};

function cloneInput(input: NatalInput): NatalInput {
  return JSON.parse(JSON.stringify(input)) as NatalInput;
}

export interface UseChartDataResult {
  chart: ChartData;
  input: NatalInput;
  runtime: ChartRuntimeState;
  profiles: ProfileRecord[];
  currentProfile?: ProfileRecord;
  updateInput: (partial: Partial<NatalInput>) => void;
  recalculate: () => void;
  toggleLayer: (key: keyof LayerToggles, value: boolean) => void;
  selectBody: (id?: string) => void;
  selectAspect: (id?: string) => void;
  saveProfile: () => void;
  loadProfile: (id: string) => void;
  removeProfile: (id: string) => void;
}

export function useChartData(): UseChartDataResult {
  const profiles = useProfileStore((state) => state.profiles);
  const currentProfileId = useProfileStore((state) => state.currentProfileId);
  const setCurrentProfile = useProfileStore((state) => state.setCurrentProfile);
  const upsertProfile = useProfileStore((state) => state.upsertProfile);
  const deleteProfile = useProfileStore((state) => state.deleteProfile);

  const [input, setInput] = useState<NatalInput>(() => cloneInput(defaultNatalInput()));
  const [chart, setChart] = useState<ChartData>(() => calculateChart(defaultNatalInput()));
  const [runtime, setRuntime] = useState<ChartRuntimeState>({ toggles: INITIAL_TOGGLES });

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.id === currentProfileId),
    [profiles, currentProfileId]
  );

  useEffect(() => {
    if (profiles.length === 0) {
      const created = createProfileFromInput(defaultNatalInput());
      upsertProfile(created);
      setCurrentProfile(created.id);
    }
  }, [profiles.length, setCurrentProfile, upsertProfile]);

  useEffect(() => {
    if (currentProfile) {
      setInput(cloneInput(currentProfile.input));
      setChart(calculateChart(currentProfile.input));
    }
  }, [currentProfile]);

  const updateInput = useCallback((partial: Partial<NatalInput>) => {
    setInput((prev) => ({ ...prev, ...partial }));
  }, []);

  const recalculate = useCallback(() => {
    setChart(calculateChart(input));
  }, [input]);

  const toggleLayer = useCallback((key: keyof LayerToggles, value: boolean) => {
    setRuntime((prev) => ({
      ...prev,
      toggles: {
        ...prev.toggles,
        [key]: value
      }
    }));
  }, []);

  const selectBody = useCallback((id?: string) => {
    setRuntime((prev) => ({
      ...prev,
      selectedBodyId: id,
      selectedAspectId: id ? undefined : prev.selectedAspectId
    }));
  }, []);

  const selectAspect = useCallback((id?: string) => {
    setRuntime((prev) => ({
      ...prev,
      selectedAspectId: id,
      selectedBodyId: id ? undefined : prev.selectedBodyId
    }));
  }, []);

  const saveProfile = useCallback(() => {
    const existing = currentProfile ? { ...currentProfile, input: cloneInput(input) } : undefined;
    const record = existing ?? createProfileFromInput(input);
    upsertProfile(record);
    setCurrentProfile(record.id);
    setChart(calculateChart(record.input));
  }, [currentProfile, input, setCurrentProfile, upsertProfile]);

  const loadProfile = useCallback(
    (id: string) => {
      setCurrentProfile(id);
    },
    [setCurrentProfile]
  );

  const removeProfile = useCallback(
    (id: string) => {
      deleteProfile(id);
      if (currentProfileId === id) {
        const remaining = profiles.filter((profile) => profile.id !== id);
        const next = remaining[0];
        if (next) {
          setCurrentProfile(next.id);
        } else {
          const fallback = createProfileFromInput(defaultNatalInput());
          upsertProfile(fallback);
          setCurrentProfile(fallback.id);
        }
      }
    },
    [currentProfileId, deleteProfile, profiles, setCurrentProfile, upsertProfile]
  );

  return {
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
  };
}
