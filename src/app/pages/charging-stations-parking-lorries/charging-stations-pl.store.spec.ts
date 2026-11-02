import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighwaysStore } from '../highways/highways.store';
import { ChargingStationsPlStore } from '././charging-stations-pl.store';

describe('ChargingStationsPlStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HighwaysStore, ChargingStationsPlStore],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('loads charging stations and parking lorries for the applied highway', async () => {
    const highwaysStore = TestBed.inject(HighwaysStore);
    const httpTesting = TestBed.inject(HttpTestingController);
    TestBed.tick();

    httpTesting.expectOne('https://api.deutschland-api.dev/autobahn').flush({
      entries: ['A1', 'A2'],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    const chargingStationsStore = TestBed.inject(ChargingStationsPlStore);
    TestBed.tick();

    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A1/charging_station')
      .flush({ entries: [] });
    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A1/parking_lorry')
      .flush({
        entries: [
          {
            id: 'parking-1',
            title: 'A1 | Test location',
            description: ['Lorry spaces: 82'],
            coordinate: { lat: '50.6', long: '6.7' },
          },
        ],
      });
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
    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A2/parking_lorry')
      .flush({
        entries: [
          {
            id: 'parking-2',
            title: 'A2 | Test location',
            description: ['Lorry spaces: 30'],
            coordinate: { lat: '51.2', long: '7.1' },
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
    expect(chargingStationsStore.parkingLorries()).toEqual([
      {
        id: 'parking-2',
        title: 'A2 | Test location',
        description: ['Lorry spaces: 30'],
        coordinate: { lat: '51.2', long: '7.1' },
      },
    ]);
    expect(chargingStationsStore.isLoading()).toBe(false);
    expect(chargingStationsStore.isLoadingParkingLorriesEntries()).toBe(false);
  });
});
