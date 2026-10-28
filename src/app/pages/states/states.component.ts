import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { StatesStore } from './states.store';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NzTableModule],
  providers: [StatesStore],
  templateUrl: './states.component.html',
  styles: ``
})
export class StatesComponent {
  protected readonly store = inject(StatesStore);

  protected onPageIndexChange(pageIndex: number): void {
    this.store.loadStates(pageIndex);
  }
}
