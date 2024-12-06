import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { DateTime } from 'luxon'

import { IExpense } from '../../interfaces/expenses.interfaces'

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Name -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input 
            matInput 
            formControlName="name"
            placeholder="Enter transaction name"
          >
          @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <!-- Amount -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Amount</mat-label>
          <input 
            matInput 
            type="number"
            formControlName="amount"
            placeholder="0.00"
            step="0.01"
            min="0"
          >
          @if (form.get('amount')?.errors?.['required'] && form.get('amount')?.touched) {
            <mat-error>Amount is required</mat-error>
          }
        </mat-form-field>

        <!-- Type -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="EXPENSE">Expense</mat-option>
            <mat-option value="INCOME">Income</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Date -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date</mat-label>
          <input 
            matInput 
            [matDatepicker]="picker"
            formControlName="date"
          >
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <button 
            mat-stroked-button 
            type="button"
            (click)="onCancel()"
          >
            Cancel
          </button>
          <button 
            mat-raised-button 
            color="primary"
            type="submit"
            [disabled]="form.invalid"
            (click)="onSubmit()"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseFormComponent {
  @Input() expense: IExpense | null = null;
  @Output() saveExpense = new EventEmitter<Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() cancelEditExpense = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit() {
    if (this.expense) {
      this.form.patchValue({
        name: this.expense.name,
        amount: this.expense.amount,
        type: this.expense.type,
        date: DateTime.fromISO(this.expense.date).toJSDate()
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: ['EXPENSE', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.saveExpense.emit({
        name: formValue.name,
        amount: Number(formValue.amount),
        type: formValue.type,
        date: String(DateTime.fromJSDate(formValue.date).toISO()),
        category: formValue.category,
      });
    }
  }

  onCancel(): void {
    this.cancelEditExpense.emit();
  }
}