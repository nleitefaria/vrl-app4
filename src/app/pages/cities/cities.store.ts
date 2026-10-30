import { httpResource } from '@angular/common/http';
import { computed, resource } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

interface City {
  id: number;
  state: string;
  rb: number;
  district: string;
  verb: string;
  gem: string;
  name: string;
  zipCode: string;
  area: number;
}

interface CityResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: City[];
}

interface DistrictOption {
  id: string;
  state: string;
  name: string;
}

interface DistrictResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: DistrictOption[];
}

interface District {
  name: string;
}

interface State {
  id: string;
  name: string;
}

interface StateResponse {
  entries: State[];
}

const pageSize = 16;
const apiBaseUrl = 'https://api.deutschland-api.dev';

function districtId(city: City): string {
  return `${city.state}${city.rb}${city.district.padStart(2, '0')}`;
}

export const CitiesStore = signalStore(
  withState({
    pageIndex: 1,
    pageSize,
    chosenStateId: '',
    chosenDistrictId: '',
    name: '',
  }),
  withProps(({ pageIndex, pageSize, chosenStateId, chosenDistrictId, name }) => ({
    citiesResource: httpResource<CityResponse>(
      () => ({
        url: `${apiBaseUrl}/city?startIndex=${(pageIndex() - 1) * pageSize()}&itemsPerPage=${pageSize()}`,
        params: {
          state: chosenStateId(),
          name: name(),
        },
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
        url: `${apiBaseUrl}/state?startIndex=0&itemsPerPage=16`,
      }),
      {
        defaultValue: {
          entries: [],
        },
      },
    ),
    districtsResource: resource<DistrictOption[], string>({
      params: () => 'districts',
      defaultValue: [],
      loader: async ({ abortSignal }) => {
        const loadPage = async (startIndex: number): Promise<DistrictResponse> => {
          const response = await fetch(
            `${apiBaseUrl}/district?startIndex=${startIndex}&itemsPerPage=${pageSize}`,
            { signal: abortSignal },
          );
          if (!response.ok) {
            throw new Error(`Failed to load districts: ${response.status}`);
          }

          return (await response.json()) as DistrictResponse;
        };

        const firstPage = await loadPage(0);
        const pageCount = Math.ceil(firstPage.totalResults / firstPage.itemsPerPage);
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            loadPage((index + 1) * firstPage.itemsPerPage),
          ),
        );

        return [firstPage, ...remainingPages].flatMap((page) => page.entries);
      },
    }),
    filteredCitiesResource: resource<
      City[],
      { districtId: string; stateId: string } | undefined
    >({
      params: () => {
        const selectedDistrictId = chosenDistrictId();
        return selectedDistrictId
          ? { districtId: selectedDistrictId, stateId: chosenStateId() }
          : undefined;
      },
      defaultValue: [],
      loader: async ({ params, abortSignal }) => {
        const stateId = params.districtId.slice(0, 2);
        if (params.stateId && params.stateId !== stateId) {
          return [];
        }

        const districtCode = params.districtId.slice(3);
        const loadPage = async (startIndex: number): Promise<CityResponse> => {
          const query = new URLSearchParams({
            startIndex: String(startIndex),
            itemsPerPage: String(pageSize),
            state: stateId,
            district: districtCode,
          });
          const response = await fetch(`${apiBaseUrl}/city?${query}`, {
            signal: abortSignal,
          });
          if (!response.ok) {
            throw new Error(`Failed to load cities: ${response.status}`);
          }

          return (await response.json()) as CityResponse;
        };

        const firstPage = await loadPage(0);
        const pageCount = Math.ceil(firstPage.totalResults / firstPage.itemsPerPage);
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            loadPage((index + 1) * firstPage.itemsPerPage),
          ),
        );

        return [firstPage, ...remainingPages]
          .flatMap((page) => page.entries)
          .filter((city) => districtId(city) === params.districtId);
      },
    }),
  })),
  withProps((store) => {
    const visibleCities = () => {
      if (store.chosenDistrictId()) {
        const start = (store.pageIndex() - 1) * store.pageSize();
        return store.filteredCitiesResource
          .value()
          .slice(start, start + store.pageSize());
      }

      return store.citiesResource.value()?.entries ?? [];
    };

    return {
      districtNamesResource: resource<Record<string, string>, string[]>({
        params: () => [...new Set(visibleCities().map((city) => districtId(city)))],
        defaultValue: {},
        loader: async ({ params, abortSignal }) => {
          const districts = await Promise.all(
            params.map(async (id) => {
              const response = await fetch(`${apiBaseUrl}/district/${id}`, {
                signal: abortSignal,
              });
              if (!response.ok) {
                throw new Error(`Failed to load district ${id}: ${response.status}`);
              }

              const district = (await response.json()) as District;
              return [id, district.name] as const;
            }),
          );

          return Object.fromEntries(districts);
        },
      }),
    };
  }),
  withComputed((store) => {
    const cities = computed(() => {
      if (store.chosenDistrictId()) {
        const start = (store.pageIndex() - 1) * store.pageSize();
        return store.filteredCitiesResource
          .value()
          .slice(start, start + store.pageSize());
      }

      return store.citiesResource.value()?.entries ?? [];
    });
    const stateNames = computed(
      () => new Map(store.statesResource.value()?.entries.map((state) => [state.id, state.name])),
    );

    return {
      cities,
      totalResults: computed(() =>
      store.chosenDistrictId()
        ? store.filteredCitiesResource.value().length
        : (store.citiesResource.value()?.totalResults ?? 0),
      ),
      stateOptions: computed(
        () =>
          store.statesResource.value()?.entries.map((state) => ({
          label: state.name,
          value: state.id,
        })) ?? [],
      ),
      districtOptions: computed(() =>
        (store.districtsResource.value() ?? []).map((district) => ({
          label: `${district.name} (${stateNames().get(district.state) ?? district.state})`,
          value: district.id,
        })),
      ),
      stateNames,
      cityDistrictNames: computed(() => {
        const names = store.districtNamesResource.value();
        return Object.fromEntries(
          cities().map((city) => [city.id, names[districtId(city)] ?? city.district]),
        );
      }),
      error: computed(
        () =>
          store.citiesResource.error() ??
          store.statesResource.error() ??
          store.districtNamesResource.error() ??
          store.districtsResource.error() ??
          store.filteredCitiesResource.error(),
      ),
      isLoading: computed(
        () =>
          store.citiesResource.isLoading() ||
          store.statesResource.isLoading() ||
          store.districtNamesResource.isLoading() ||
          store.districtsResource.isLoading() ||
          store.filteredCitiesResource.isLoading(),
      ),
    };
  }),
  withMethods((store) => ({
    setPageIndex(pageIndex: number): void {
      patchState(store, { pageIndex });
    },
    applyFilters(filters: { stateId: string; districtId: string; name: string }): void {
      patchState(store, {
        chosenStateId: filters.stateId,
        chosenDistrictId: filters.districtId,
        name: filters.name,
        pageIndex: 1,
      });
    },
  })),
);
