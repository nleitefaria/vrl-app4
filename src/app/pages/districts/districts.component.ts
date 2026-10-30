import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { DistrictsStore } from './districts.store';

@Component({
  selector: 'app-districts',
  standalone: true,
  imports: [
    NzTableModule,
    NzFormModule,
    NzAutocompleteModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzButtonComponent,
  ],
  providers: [DistrictsStore],
  templateUrl: './districts.component.html',
  styles: ``,
})
export class DistrictsComponent {
  protected readonly store = inject(DistrictsStore);
  validateForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      myCombobox: [null, []],
    });
  }

  protected onPageIndexChange(pageIndex: number): void {
    this.store.setPageIndex(pageIndex);
  }

  submitForm(): void {
    this.store.setChosenStateId(this.validateForm.get('myCombobox')?.value ?? '');
  }
}
