import { httpResource } from '@angular/common/http';
import { effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

interface AutobahnResponse {
  entries: string[];
}

export const HighwaysStore = signalStore(
  withState({
    selectedHighway: null as string | null,
    highwayId: 'a',
    hasInitializedSelection: false,
  }),
  withProps(() => ({
    autobahnsResource: httpResource<AutobahnResponse>(
      () => ({
        url: 'https://api.deutschland-api.dev/autobahn',
      }),
      {
        defaultValue: {
          entries: [],
        },
      },
    ),
  })),
  withComputed(({ autobahnsResource }) => ({
    autobahns: () => [...new Set(autobahnsResource.value()?.entries ?? [])],
    error: () => autobahnsResource.error(),
    isLoading: () => autobahnsResource.isLoading(),
  })),
  withMethods((store) => ({
    setSelectedHighway(selectedHighway: string | null): void {
      patchState(store, { selectedHighway });
    },
    submitHighway(): void {
      patchState(store, { highwayId: store.selectedHighway() ?? '' });
    },
  })),
  withHooks({
    onInit(store) {
      effect(() => {
        const firstHighway = store.autobahns()[0];
        if (!firstHighway || store.hasInitializedSelection()) {
          return;
        }

        patchState(store, {
          selectedHighway: firstHighway,
          highwayId: firstHighway,
          hasInitializedSelection: true,
        });
      });
    },
  }),
);
