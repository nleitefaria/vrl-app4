import { Component, computed } from '@angular/core';
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
  protected readonly districtsResource = httpResource<DistrictResponse>(
    () => ({
      url: 'https://api.deutschland-api.dev/district',
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

  protected readonly error = this.districtsResource.error;
  protected readonly isLoading = this.districtsResource.isLoading;
}
