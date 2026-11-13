import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { ChargingStationsPlStore } from '././charging-stations-pl.store';

@Component({
  selector: 'app-charging-stations',
  standalone: true,
  imports: [NzTableModule, NzCardModule, NzGridModule, NzButtonModule, NzIconModule, NzModalModule],
  providers: [ChargingStationsPlStore],
  templateUrl: './charging-stations-pl.component.html',
})
export class ChargingStationsPlComponent {
  readonly store = inject(ChargingStationsPlStore);
  detailsModalVisible = false;
  detailsTitle = '';
  detailsDescription: string[] = [];
  detailsCoordinate: { lat: string; long: string } | null = null;

  showDetails(
    title: string,
    description: string[],
    coordinate: { lat: string; long: string },
  ): void {
    this.detailsTitle = title;
    this.detailsDescription = description;
    this.detailsCoordinate = coordinate;
    this.detailsModalVisible = true;
  }

  closeDetails(): void {
    this.detailsModalVisible = false;
    this.detailsCoordinate = null;
  }
}
