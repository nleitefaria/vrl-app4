import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, tap, catchError } from 'rxjs';

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

interface StatesState {
  states: State[];
  totalResults: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  states: [],
  totalResults: 0,
  pageIndex: 1,
  pageSize: 16,
  isLoading: false,
  error: null,
};

export const StatesStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    startIndex: () => (store.pageIndex() - 1) * store.pageSize(),
  })),
  withMethods((store) => {
    const http = inject(HttpClient);

    return {
      loadStates: rxMethod<number>(
        pipe(
          tap((pageIndex) =>
            patchState(store, {
              pageIndex,
              isLoading: true,
              error: null,
            }),
          ),
          switchMap((pageIndex) =>
            http
              .get<StateResponse>('https://api.deutschland-api.dev/state', {
                params: {
                  startIndex: String(store.startIndex()),
                  itemsPerPage: String(store.pageSize()),
                },
              })
              .pipe(
                tap((response) =>
                  patchState(store, {
                    states: response.entries,
                    totalResults: response.totalResults,
                    isLoading: false,
                  }),
                ),
                catchError((error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: error instanceof Error ? error.message : String(error),
                  });
                  return EMPTY;
                }),
              ),
          ),
        ),
      ),
    };
  }),
  withHooks({
    onInit(store) {
      store.loadStates(store.pageIndex());
    },
  }),
);
