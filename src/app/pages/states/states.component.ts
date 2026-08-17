import { Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';

interface State {
  id: string;
  name: string;
  area: number;
}

interface StateResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: State[];
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NzTableModule],
  templateUrl: './states.component.html',
  styles: ``
})
export class StatesComponent {

  protected readonly statesResource = httpResource<StateResponse>(
    () => ({
      url: 'https://api.deutschland-api.dev/state'
    }),
    {
      defaultValue: {
        totalResults: 0,
        startIndex: 0,
        itemsPerPage: 0,
        entries: []
      }
    }
  );

  readonly states = computed(() => {
    const response = this.statesResource.value();
    return response?.entries ?? [];
  });
  protected readonly error = this.statesResource.error;
  protected readonly isLoading = this.statesResource.isLoading;
}
