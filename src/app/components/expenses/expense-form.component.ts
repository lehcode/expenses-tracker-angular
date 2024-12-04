import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatNativeDateModule } from '@angular/material/core'
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
    MatNativeDateModule,
    MatButtonModule
  ],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h2 class="text-xl mb-6">New Transaction</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Name -->
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Name</mat-label>
            <input 
              matInput 
              formControlName="name"
              placeholder="Transaction name"
            >
            @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <!-- Amount -->
          <mat-form-field appearance="outline" class="w-full mb-4">
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
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="EXPENSE">Expense</mat-option>
              <mat-option value="INCOME">Income</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Date -->
          <mat-form-field appearance="outline" class="w-full mb-6">
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
              (click)="cancelExpenseEvent.emit()"
            >
              Cancel
            </button>
            <button 
              mat-raised-button 
              color="primary"
              type="submit"
              [disabled]="form.invalid"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseFormComponent {
  @Output() saveExpenseEvent = new EventEmitter<Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() cancelExpenseEvent = new EventEmitter<void>()
  @Input() expense: IExpense | null = null;

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.createForm()
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: ['EXPENSE', Validators.required],
      date: [new Date(), Validators.required]
    })
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value
      this.saveExpenseEvent.emit({
        name: formValue.name,
        amount: Number(formValue.amount),
        type: formValue.type,
        // @ts-expect-error ts(2322)
        date: formValue.date ? DateTime.fromJSDate(formValue.date).toISO() : null,
      })
    }
  }
}