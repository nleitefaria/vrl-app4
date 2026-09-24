import { Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';

interface District {
  id: string;
  state: string;
  type: string;
  name: string;
  nuts3: string;
  area: number;
}

interface DistrictResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: District[];
}

@Component({
  selector: 'app-districts',
  standalone: true,
  imports: [NzTableModule],
  templateUrl: './districts.component.html',
  styles: ``
})
export class DistrictsComponent {
  protected readonly pageSize = 16;
  protected readonly pageIndex = signal(1);

  protected readonly districtsResource = httpResource<DistrictResponse>(
    () => ({
      url: `https://api.deutschland-api.dev/district?startIndex=${(this.pageIndex() - 1) * this.pageSize}&itemsPerPage=${this.pageSize}`,
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

  readonly districts = computed(() => {
    const response = this.districtsResource.value();
    return response?.entries ?? [];
  });
  readonly totalResults = computed(() => this.districtsResource.value()?.totalResults ?? 0);

  protected onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }

  protected readonly error = this.districtsResource.error;
  protected readonly isLoading = this.districtsResource.isLoading;
}
