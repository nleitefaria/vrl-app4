import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CitiesStore } from './cities.store';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [
    NzTableModule,
    NzFormModule,
    NzAutocompleteModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzButtonComponent,
    NzInputModule,
  ],
  providers: [CitiesStore],
  templateUrl: './cities.component.html',
  styles: ``,
})
export class CitiesComponent {
  protected readonly store = inject(CitiesStore);
  validateForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: '',
      myCombobox: [null, []],
      districtCombobox: [null, []],
    });
  }

  protected onPageIndexChange(pageIndex: number): void {
    this.store.setPageIndex(pageIndex);
  }

  submitForm(): void {
    this.store.applyFilters({
      stateId: this.validateForm.get('myCombobox')?.value ?? '',
      districtId: this.validateForm.get('districtCombobox')?.value ?? '',
      name: this.validateForm.get('name')?.value ?? '',
    });
  }
}
