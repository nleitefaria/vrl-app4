import { Component, computed, signal } from '@angular/core';
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

  protected onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }

  protected readonly error = this.citiesResource.error;
  protected readonly isLoading = this.citiesResource.isLoading;
}
