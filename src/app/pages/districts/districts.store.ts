import { httpResource } from '@angular/common/http';
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

interface District {
  id: string;
  state: string;
  type: string;
  name: string;
  nuts3: string;
  area: number;
}

interface DistrictResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: District[];
}

interface State {
  id: string;
  name: string;
}

interface StateResponse {
  entries: State[];
}

export const DistrictsStore = signalStore(
  withState({
    pageIndex: 1,
    pageSize: 16,
    chosenStateId: '',
  }),
  withProps(({ pageIndex, pageSize, chosenStateId }) => ({
    districtsResource: httpResource<DistrictResponse>(
      () => ({
        url: `https://api.deutschland-api.dev/district?startIndex=${(pageIndex() - 1) * pageSize()}&itemsPerPage=${pageSize()}`,
        params: { state: chosenStateId() },
      }),
      {
        defaultValue: {
          totalResults: 0,
          startIndex: 0,
          itemsPerPage: 0,
          entries: [],
        },
      },
    ),
    statesResource: httpResource<StateResponse>(
      () => ({
        url: 'https://api.deutschland-api.dev/state?startIndex=0&itemsPerPage=16',
      }),
      {
        defaultValue: {
          entries: [],
        },
      },
    ),
  })),
  withComputed(({ districtsResource, statesResource }) => ({
    districts: computed(() => districtsResource.value()?.entries ?? []),
    totalResults: computed(() => districtsResource.value()?.totalResults ?? 0),
    stateOptions: computed(
      () =>
        statesResource.value()?.entries.map((state) => ({
          label: state.name,
          value: state.id,
        })) ?? [],
    ),
    stateNames: computed(
      () => new Map(statesResource.value()?.entries.map((state) => [state.id, state.name])),
    ),
    error: computed(() => districtsResource.error() ?? statesResource.error()),
    isLoading: computed(() => districtsResource.isLoading() || statesResource.isLoading()),
  })),
  withMethods((store) => ({
    setPageIndex(pageIndex: number): void {
      patchState(store, { pageIndex });
    },
    setChosenStateId(chosenStateId: string): void {
      patchState(store, { chosenStateId, pageIndex: 1 });
    },
  })),
);
