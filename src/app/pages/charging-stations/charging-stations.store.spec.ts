import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighwaysStore } from '../highways/highways.store';
import { ChargingStationsStore } from './charging-stations.store';

describe('ChargingStationsStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HighwaysStore, ChargingStationsStore],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('loads charging stations for the applied highway', async () => {
    const highwaysStore = TestBed.inject(HighwaysStore);
    const httpTesting = TestBed.inject(HttpTestingController);
    TestBed.tick();

    httpTesting.expectOne('https://api.deutschland-api.dev/autobahn').flush({
      entries: ['A1', 'A2'],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    const chargingStationsStore = TestBed.inject(ChargingStationsStore);
    TestBed.tick();

    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A1/charging_station')
      .flush({ entries: [] });
    TestBed.tick();

    highwaysStore.setSelectedHighway('A2');
    highwaysStore.submitHighway();
    TestBed.tick();
    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A2/charging_station')
      .flush({
        entries: [
          {
            id: 'station-1',
            title: 'A1 | Test location',
            description: ['2 charging points', '150 kW'],
            coordinate: { lat: '50.6', long: '6.7' },
          },
        ],
      });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(chargingStationsStore.highwayId()).toBe('A2');
    expect(chargingStationsStore.chargingStations()).toEqual([
      {
        id: 'station-1',
        title: 'A1 | Test location',
        description: ['2 charging points', '150 kW'],
        coordinate: { lat: '50.6', long: '6.7' },
      },
    ]);
    expect(chargingStationsStore.isLoading()).toBe(false);
  });
});
