import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ClosuresWarningsStore } from './closures-warnings.store';

@Component({
  selector: 'app-closures-warnings',
  standalone: true,
  imports: [NzButtonModule, NzCardModule, NzIconModule, NzModalModule, NzTableModule],
  providers: [ClosuresWarningsStore],
  templateUrl: './closures-warnings.component.html',
})
export class ClosuresWarningsComponent {
  readonly store = inject(ClosuresWarningsStore);
  detailsModalVisible = false;
  detailsTitle = '';
  detailsDescription: string[] = [];

  showDetails(title: string, description: string[] = []): void {
    this.detailsTitle = title;
    this.detailsDescription = description;
    this.detailsModalVisible = true;
  }

  closeDetails(): void {
    this.detailsModalVisible = false;
  }
}
