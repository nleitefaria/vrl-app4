import { Component, computed, resource, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';

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

interface District {
  name: string;
}

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [NzTableModule],
  templateUrl: './cities.component.html',
  styles: ``
})
export class CitiesComponent {
  protected readonly pageSize = 16;
  protected readonly pageIndex = signal(1);

  protected readonly citiesResource = httpResource<CityResponse>(
    () => ({
      url: `https://api.deutschland-api.dev/city?startIndex=${(this.pageIndex() - 1) * this.pageSize}&itemsPerPage=${this.pageSize}`,
    }),
    {
      defaultValue: {
        totalResults: 0,
        startIndex: 0,
        itemsPerPage: 0,
        entries: [],
      },
    }
  );

  readonly cities = computed(() => {
    const response = this.citiesResource.value();
    return response?.entries ?? [];
  });
  readonly totalResults = computed(() => this.citiesResource.value()?.totalResults ?? 0);
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
        })
      );

      return Object.fromEntries(districts);
    },
  });
  readonly cityDistrictNames = computed(() => {
    const names = this.districtNamesResource.value();
    return Object.fromEntries(
      this.cities().map((city) => [
        city.id,
        names[this.districtId(city)] ?? city.district,
      ])
    );
  });
  protected readonly error = computed(
    () => this.citiesResource.error() ?? this.districtNamesResource.error()
  );
  protected readonly isLoading = computed(
    () => this.citiesResource.isLoading() || this.districtNamesResource.isLoading()
  );

  protected onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }

  protected districtId(city: City): string {
    return `${city.state}${city.rb}${city.district.padStart(2, '0')}`;
  }
}
