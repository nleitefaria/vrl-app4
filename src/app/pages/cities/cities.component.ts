import { Component, computed, resource, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

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

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [
    NzTableModule,
    NzFormModule,
    NzAutocompleteModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzButtonComponent,
    NzInputModule
  ],
  templateUrl: './cities.component.html',
  styles: ``,
})
export class CitiesComponent {
  validateForm!: FormGroup;

  readonly listOfOption = computed(() =>
    (this.statesResource.value()?.entries ?? []).map((state) => ({
      label: state.name,
      value: state.id,
    })),
  );
  readonly listOfDistrictOption = computed(() =>
    (this.districtsResource.value() ?? []).map((district) => ({
      label: `${district.name} (${this.stateNames().get(district.state) ?? district.state})`,
      value: district.id,
    })),
  );

  chosenStateId = signal('');
  chosenDistrictId = signal('');
  name = signal('');

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: '',
      myCombobox: [null, []],
      districtCombobox: [null, []],
    });
  }

  protected readonly pageSize = 16;
  protected readonly pageIndex = signal(1);

  protected readonly citiesResource = httpResource<CityResponse>(
    () => ({
      url: `https://api.deutschland-api.dev/city?startIndex=${(this.pageIndex() - 1) * this.pageSize}&itemsPerPage=${this.pageSize}`,
      params: {
        state: this.chosenStateId(),
        district: this.chosenDistrictId(),
        name: this.name()
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
  );

  protected readonly statesResource = httpResource<StateResponse>(
    () => ({
      url: 'https://api.deutschland-api.dev/state?startIndex=0&itemsPerPage=16',
    }),
    {
      defaultValue: {
        entries: [],
      },
    },
  );

  protected readonly districtsResource = resource<DistrictOption[], string>({
    params: () => 'districts',
    defaultValue: [],
    loader: async ({ abortSignal }) => {
      const loadPage = async (startIndex: number): Promise<DistrictResponse> => {
        const response = await fetch(
          `https://api.deutschland-api.dev/district?startIndex=${startIndex}&itemsPerPage=${this.pageSize}`,
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
  });
  protected readonly filteredCitiesResource = resource<
    City[],
    { districtId: string; stateId: string } | undefined
  >({
    params: () => {
      const districtId = this.chosenDistrictId();
      return districtId ? { districtId, stateId: this.chosenStateId() } : undefined;
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
          itemsPerPage: String(this.pageSize),
          state: stateId,
          district: districtCode,
        });
        const response = await fetch(`https://api.deutschland-api.dev/city?${query}`, {
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
        .filter((city) => this.districtId(city) === params.districtId);
    },
  });
  readonly cities = computed(() => {
    if (this.chosenDistrictId()) {
      const start = (this.pageIndex() - 1) * this.pageSize;
      return this.filteredCitiesResource.value().slice(start, start + this.pageSize);
    }
    return this.citiesResource.value()?.entries ?? [];
  });
  readonly totalResults = computed(() =>
    this.chosenDistrictId()
      ? this.filteredCitiesResource.value().length
      : (this.citiesResource.value()?.totalResults ?? 0),
  );
  readonly stateNames = computed(
    () => new Map(this.statesResource.value()?.entries.map((state) => [state.id, state.name])),
  );
  protected readonly districtNamesResource = resource<Record<string, string>, string[]>({
    params: () => [...new Set(this.cities().map((city) => this.districtId(city)))],
    defaultValue: {},
    loader: async ({ params, abortSignal }) => {
      const districts = await Promise.all(
        params.map(async (id) => {
          const response = await fetch(`https://api.deutschland-api.dev/district/${id}`, {
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
  });
  readonly cityDistrictNames = computed(() => {
    const names = this.districtNamesResource.value();
    return Object.fromEntries(
      this.cities().map((city) => [city.id, names[this.districtId(city)] ?? city.district]),
    );
  });
  protected readonly error = computed(
    () =>
      this.citiesResource.error() ??
      this.statesResource.error() ??
      this.districtNamesResource.error() ??
      this.districtsResource.error() ??
      this.filteredCitiesResource.error(),
  );
  protected readonly isLoading = computed(
    () =>
      this.citiesResource.isLoading() ||
      this.statesResource.isLoading() ||
      this.districtNamesResource.isLoading() ||
      this.districtsResource.isLoading() ||
      this.filteredCitiesResource.isLoading(),
  );

  protected onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }

  protected districtId(city: City): string {
    return `${city.state}${city.rb}${city.district.padStart(2, '0')}`;
  }

  submitForm(): void {
    this.chosenStateId.set(this.validateForm.get('myCombobox')?.value ?? '');
    this.chosenDistrictId.set(this.validateForm.get('districtCombobox')?.value ?? '');
    this.name.set(this.validateForm.get('name')?.value ?? '');
    this.pageIndex.set(1);
  }
}
