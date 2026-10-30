import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ChargingStationsStore } from './charging-stations.store';

@Component({
  selector: 'app-charging-stations',
  standalone: true,
  imports: [NzTableModule],
  providers: [ChargingStationsStore],
  templateUrl: './charging-stations.component.html',
})
export class ChargingStationsComponent {
  readonly store = inject(ChargingStationsStore);
}
