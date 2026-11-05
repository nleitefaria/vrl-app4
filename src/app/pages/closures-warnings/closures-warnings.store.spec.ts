import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighwaysStore } from '../highways/highways.store';
import { ClosuresWarningsStore } from './closures-warnings.store';

describe('ClosuresWarningsStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HighwaysStore,
        ClosuresWarningsStore,
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('loads closures and warnings for the applied highway', async () => {
    const highwaysStore = TestBed.inject(HighwaysStore);
    const httpTesting = TestBed.inject(HttpTestingController);
    TestBed.tick();

    httpTesting.expectOne('https://api.deutschland-api.dev/autobahn').flush({
      entries: ['A1', 'A2'],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    const closuresWarningsStore = TestBed.inject(ClosuresWarningsStore);
    TestBed.tick();
    httpTesting.expectOne('https://api.deutschland-api.dev/autobahn/A1/closure').flush({
      entries: [
        {
          id: 'closure-1',
          title: 'A1 | Closure location',
          subtitle: 'Hamburg -> Bremen',
          blocked: false,
          future: true,
          description: ['Planned roadworks'],
        },
      ],
    });
    httpTesting.expectOne('https://api.deutschland-api.dev/autobahn/A1/warning').flush({
      entries: [
        {
          id: 'warning-1',
          title: 'A1 | Warning location',
          subtitle: 'Cologne -> Dortmund',
          blocked: false,
          future: false,
          startDate: '2026-11-05T17:17:00Z',
          description: ['Slow traffic'],
        },
      ],
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(closuresWarningsStore.records()).toEqual([
      {
        id: 'closure-1',
        title: 'A1 | Closure location',
        subtitle: 'Hamburg -> Bremen',
        blocked: false,
        future: true,
        description: ['Planned roadworks'],
        recordType: 'Closure',
      },
      {
        id: 'warning-1',
        title: 'A1 | Warning location',
        subtitle: 'Cologne -> Dortmund',
        blocked: false,
        future: false,
        startDate: '2026-11-05T17:17:00Z',
        description: ['Slow traffic'],
        recordType: 'Warning',
      },
    ]);

    highwaysStore.setSelectedHighway('A2');
    highwaysStore.submitHighway();
    TestBed.tick();
    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A2/closure')
      .flush({ entries: [] });
    httpTesting
      .expectOne('https://api.deutschland-api.dev/autobahn/A2/warning')
      .flush({ entries: [] });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(closuresWarningsStore.records()).toEqual([]);
    expect(closuresWarningsStore.isLoading()).toBe(false);
  });
});
