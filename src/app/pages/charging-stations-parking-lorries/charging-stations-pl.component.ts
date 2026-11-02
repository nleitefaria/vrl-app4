import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { ChargingStationsPlStore } from '././charging-stations-pl.store';

@Component({
  selector: 'app-charging-stations',
  standalone: true,
  imports: [NzTableModule, NzCardModule, NzGridModule],
  providers: [ChargingStationsPlStore],
  templateUrl: './charging-stations-pl.component.html',
})
export class ChargingStationsPlComponent {
  readonly store = inject(ChargingStationsPlStore);
}
