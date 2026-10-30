import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HighwaysComponent } from './highways.component';

describe('HighwaysComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighwaysComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('selects the first loaded highway without overriding later selections', async () => {
    const fixture = TestBed.createComponent(HighwaysComponent);
    fixture.detectChanges();

    const request = TestBed.inject(HttpTestingController).expectOne(
      'https://api.deutschland-api.dev/autobahn',
    );
    request.flush({ entries: ['A1', 'A2'] });
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.store.selectedHighway()).toBe('A1');
    expect(component.store.highwayId()).toBe('A1');

    component.store.setSelectedHighway('A2');
    expect(component.store.highwayId()).toBe('A1');

    component.submitForm();
    expect(component.store.highwayId()).toBe('A2');
  });
});
