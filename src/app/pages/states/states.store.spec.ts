import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatesStore } from './states.store';

describe('StatesStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatesStore, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('loads states and reloads the requested page', async () => {
    const store = TestBed.inject(StatesStore);
    const httpTesting = TestBed.inject(HttpTestingController);
    TestBed.tick();

    httpTesting.expectOne(
      (request) =>
        request.urlWithParams ===
        'https://api.deutschland-api.dev/state?startIndex=0&itemsPerPage=16',
    ).flush({
      totalResults: 17,
      startIndex: 0,
      itemsPerPage: 16,
      entries: [{ id: '01', name: 'Schleswig-Holstein', area: 15804 }],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.states()).toEqual([{ id: '01', name: 'Schleswig-Holstein', area: 15804 }]);
    expect(store.totalResults()).toBe(17);
    expect(store.isLoading()).toBe(false);

    store.setPageIndex(2);
    TestBed.tick();
    httpTesting.expectOne(
      (request) =>
        request.urlWithParams ===
        'https://api.deutschland-api.dev/state?startIndex=16&itemsPerPage=16',
    ).flush({
      totalResults: 17,
      startIndex: 16,
      itemsPerPage: 16,
      entries: [{ id: '17', name: 'New state', area: 100 }],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.pageIndex()).toBe(2);
    expect(store.states()).toEqual([{ id: '17', name: 'New state', area: 100 }]);
  });
});
