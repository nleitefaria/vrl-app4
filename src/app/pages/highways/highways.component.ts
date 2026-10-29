import { Component, computed, effect, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

interface AutobahnResponse {
  entries: string[];
}

@Component({
  selector: 'app-highways',
  standalone: true,
  imports: [
    NzSelectModule,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzRowDirective,
    ReactiveFormsModule,
    NzButtonComponent,
    NzTabsModule
  ],
  templateUrl: './highways.component.html',
  styles: ``,
})
export class HighwaysComponent {
  validateForm: FormGroup;

  highwayId = signal('a');

  private hasInitializedSelection = false;

  constructor(private fb: FormBuilder) {
    this.validateForm = this.fb.group({
      hwId: [null, []],
    });

    effect(() => {
      const options = this.autobahns();
      if (options.length === 0 || this.hasInitializedSelection) {
        return;
      }

      this.validateForm.get('hwId')?.setValue(options[0]);
      this.hasInitializedSelection = true;
      this.highwayId.set(options[0]);
    });
  }

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

  readonly autobahns = computed(() => [...new Set(this.autobahnsResource.value()?.entries ?? [])]);

  protected readonly error = this.autobahnsResource.error;
  protected readonly isLoading = this.autobahnsResource.isLoading;

  submitForm(): void {
    this.highwayId.set(this.validateForm.get('hwId')?.value ?? '');
  }
}
