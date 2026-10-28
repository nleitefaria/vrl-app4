import { computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

interface State {
  id: string;
  name: string;
  area: number;
}

interface StateResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: State[];
}

export const StatesStore = signalStore(
  withState({
    pageIndex: 1,
    pageSize: 16,
  }),
  withProps(({ pageIndex, pageSize }) => ({
    statesResource: httpResource<StateResponse>(
      () => ({
        url: `https://api.deutschland-api.dev/state?startIndex=${(pageIndex() - 1) * pageSize()}&itemsPerPage=${pageSize()}`,
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
  })),
  withComputed(({ statesResource }) => ({
    states: computed(() => statesResource.value()?.entries ?? []),
    totalResults: computed(() => statesResource.value()?.totalResults ?? 0),
    error: computed(() => statesResource.error()),
    isLoading: computed(() => statesResource.isLoading()),
  })),
  withMethods((store) => ({
    setPageIndex(pageIndex: number): void {
      patchState(store, { pageIndex });
    },
  })),
);
