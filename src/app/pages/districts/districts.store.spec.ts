import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DistrictsStore } from './districts.store';

describe('DistrictsStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DistrictsStore, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('loads districts and states and applies the selected state filter', async () => {
    const store = TestBed.inject(DistrictsStore);
    const httpTesting = TestBed.inject(HttpTestingController);
    TestBed.tick();

    httpTesting.expectOne(
      'https://api.deutschland-api.dev/district?startIndex=0&itemsPerPage=16&state=',
    ).flush({
      totalResults: 400,
      startIndex: 0,
      itemsPerPage: 16,
      entries: [
        {
          id: '01001',
          state: '01',
          type: 'Kreisfreie Stadt',
          name: 'Flensburg, Stadt',
          nuts3: 'DEF01',
          area: 56,
        },
      ],
    });
    httpTesting.expectOne('https://api.deutschland-api.dev/state?startIndex=0&itemsPerPage=16').flush({
      entries: [{ id: '01', name: 'Schleswig-Holstein' }],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.districts()).toHaveLength(1);
    expect(store.totalResults()).toBe(400);
    expect(store.stateNames().get('01')).toBe('Schleswig-Holstein');

    store.setPageIndex(3);
    TestBed.tick();
    httpTesting.expectOne(
      'https://api.deutschland-api.dev/district?startIndex=32&itemsPerPage=16&state=',
    ).flush({
      totalResults: 400,
      startIndex: 32,
      itemsPerPage: 16,
      entries: [],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    store.setChosenStateId('01');
    expect(store.pageIndex()).toBe(1);
    TestBed.tick();
    httpTesting.expectOne(
      'https://api.deutschland-api.dev/district?startIndex=0&itemsPerPage=16&state=01',
    ).flush({
      totalResults: 1,
      startIndex: 0,
      itemsPerPage: 16,
      entries: [
        {
          id: '01001',
          state: '01',
          type: 'Kreisfreie Stadt',
          name: 'Flensburg, Stadt',
          nuts3: 'DEF01',
          area: 56,
        },
      ],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.districts()).toHaveLength(1);
    expect(store.totalResults()).toBe(1);
  });
});
