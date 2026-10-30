import { Component, inject } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HighwaysStore } from './highways.store';
import { ChargingStationsComponent } from './charging-stations/charging-stations.component';

@Component({
  selector: 'app-highways',
  standalone: true,
  imports: [
    NzSelectModule,
    NzFormModule,
    FormsModule,
    NzButtonComponent,
    NzTabsModule,
    ChargingStationsComponent,
  ],
  providers: [HighwaysStore],
  templateUrl: './highways.component.html',
  styles: ``,
})
export class HighwaysComponent {
  readonly store = inject(HighwaysStore);

  submitForm(): void {
    this.store.submitHighway();
  }
}
