import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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

  it('loads and paginates states', () => {
    const store = TestBed.inject(StatesStore);
    const httpTesting = TestBed.inject(HttpTestingController);

    httpTesting.expectOne(
      (request) =>
        request.url === 'https://api.deutschland-api.dev/state' &&
        request.params.get('startIndex') === '0' &&
        request.params.get('itemsPerPage') === '16',
    ).flush({
      totalResults: 17,
      startIndex: 0,
      itemsPerPage: 16,
      entries: [{ id: '01', name: 'Schleswig-Holstein', area: 15804 }],
    });

    expect(store.states()).toEqual([{ id: '01', name: 'Schleswig-Holstein', area: 15804 }]);
    expect(store.totalResults()).toBe(17);
    expect(store.isLoading()).toBe(false);

    store.loadStates(2);
    httpTesting.expectOne(
      (request) =>
        request.url === 'https://api.deutschland-api.dev/state' &&
        request.params.get('startIndex') === '16',
    ).flush({
      totalResults: 17,
      startIndex: 16,
      itemsPerPage: 16,
      entries: [{ id: '17', name: 'New state', area: 100 }],
    });

    expect(store.pageIndex()).toBe(2);
    expect(store.states()).toEqual([{ id: '17', name: 'New state', area: 100 }]);
  });
});
