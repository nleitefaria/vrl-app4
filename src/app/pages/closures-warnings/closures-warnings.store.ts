import { httpResource } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withProps } from '@ngrx/signals';
import { HighwaysStore } from '../highways/highways.store';

interface ClosureOrWarning {
  id: string;
  title: string;
  subtitle?: string;
  description?: string[];
  blocked?: boolean;
  future?: boolean;
  startDate?: string;
}

interface ClosureOrWarningResponse {
  entries: ClosureOrWarning[];
}

export interface ClosureWarningRecord extends ClosureOrWarning {
  recordType: 'Closure' | 'Warning';
}

export const ClosuresWarningsStore = signalStore(
  withProps(() => {
    const highwaysStore = inject(HighwaysStore);
    const requestForSelectedHighway = (endpoint: string) => {
      const highwayId = highwaysStore.highwayId();
      return highwaysStore.hasInitializedSelection() && highwayId
        ? {
            url: `https://api.deutschland-api.dev/autobahn/${encodeURIComponent(highwayId)}/${endpoint}`,
          }
        : undefined;
    };

    return {
      closuresResource: httpResource<ClosureOrWarningResponse>(
        () => requestForSelectedHighway('closure'),
        { defaultValue: { entries: [] } },
      ),
      warningsResource: httpResource<ClosureOrWarningResponse>(
        () => requestForSelectedHighway('warning'),
        { defaultValue: { entries: [] } },
      ),
    };
  }),
  withComputed(({ closuresResource, warningsResource }) => ({
    records: computed<ClosureWarningRecord[]>(() => [
      ...(closuresResource.value()?.entries ?? []).map((entry) => ({
        ...entry,
        recordType: 'Closure' as const,
      })),
      ...(warningsResource.value()?.entries ?? []).map((entry) => ({
        ...entry,
        recordType: 'Warning' as const,
      })),
    ]),
    closuresError: computed(() => closuresResource.error()),
    warningsError: computed(() => warningsResource.error()),
    isLoading: computed(() => closuresResource.isLoading() || warningsResource.isLoading()),
  })),
);
