import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { ChargingStationsPlStore } from '././charging-stations-pl.store';

@Component({
  selector: 'app-charging-stations',
  standalone: true,
  imports: [
    NzTableModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzPopoverModule,
  ],
  providers: [ChargingStationsPlStore],
  templateUrl: './charging-stations-pl.component.html',
})
export class ChargingStationsPlComponent {
  readonly store = inject(ChargingStationsPlStore);
}
