import { httpResource } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withProps } from '@ngrx/signals';
import { HighwaysStore } from '../highways/highways.store';

interface ChargingStation {
  id: string;
  title: string;
  description: string[];
  coordinate: {
    lat: string;
    long: string;
  };
}

interface ChargingStationsResponse {
  entries: ChargingStation[];
}

export const ChargingStationsStore = signalStore(
  withProps(() => {
    const highwaysStore = inject(HighwaysStore);

    return {
      highwayId: highwaysStore.highwayId,
      chargingStationsResource: httpResource<ChargingStationsResponse>(() => {
        const highwayId = highwaysStore.highwayId();
        return highwaysStore.hasInitializedSelection() && highwayId
          ? {
              url: `https://api.deutschland-api.dev/autobahn/${encodeURIComponent(highwayId)}/charging_station`,
            }
          : undefined;
      }, {
        defaultValue: {
          entries: [],
        },
      }),
    };
  }),
  withComputed(({ chargingStationsResource }) => ({
    chargingStations: computed(() => chargingStationsResource.value()?.entries ?? []),
    error: computed(() => chargingStationsResource.error()),
    isLoading: computed(() => chargingStationsResource.isLoading()),
  })),
);
