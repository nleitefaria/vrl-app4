import { Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';

interface AutobahnResponse {
  entries: string[];
}

@Component({
  selector: 'app-highways',
  standalone: true,
  imports: [NzSelectModule],
  templateUrl: './highways.component.html',
  styles: ``,
})
export class HighwaysComponent {
  protected readonly autobahnsResource = httpResource<AutobahnResponse>(
    () => ({
      url: 'https://api.deutschland-api.dev/autobahn',
    }),
    {
      defaultValue: {
        entries: [],
      },
    },
  );

  readonly autobahns = computed(
    () => [...new Set(this.autobahnsResource.value()?.entries ?? [])],
  );

  protected readonly error = this.autobahnsResource.error;
  protected readonly isLoading = this.autobahnsResource.isLoading;
}
