import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { Store } from '@ngrx/store'
import { DateTime } from 'luxon'
import { Observable } from 'rxjs'

import type { IExpense, IExpenseCategory } from '../../interfaces/expenses.interfaces'
import { ExpensesActions } from '../../store/actions/expenses.actions'
import { selectCategories } from '../../store/selectors/expenses.selectors'

interface ExpenseFormData {
  expense?: IExpense;
  isEditMode?: boolean;
}

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
    MatIconModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Name -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter transaction name" />
          @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
          @if (form.get('name')?.errors?.['minlength']) {
            <mat-error>Name must be at least 3 characters</mat-error>
          }
        </mat-form-field>

        <!-- Amount -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" placeholder="0.00" step="0.01" min="0" />
          @if (form.get('amount')?.errors?.['required'] && form.get('amount')?.touched) {
            <mat-error>Amount is required</mat-error>
          }
          @if (form.get('amount')?.errors?.['min']) {
            <mat-error>Amount must be greater than 0</mat-error>
          }
        </mat-form-field>

        <!-- Type -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="EXPENSE">Expense</mat-option>
            <mat-option value="INCOME">Income</mat-option>
          </mat-select>
          @if (form.get('type')?.errors?.['required'] && form.get('type')?.touched) {
            <mat-error>Type is required</mat-error>
          }
        </mat-form-field>

        <!-- Category -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            @for (category of categories$ | async; track category.id) {
              <mat-option [value]="category">{{ category.name }}</mat-option>
            }
          </mat-select>
          @if (form.get('category')?.errors?.['required'] && form.get('category')?.touched) {
            <mat-error>Category is required</mat-error>
          }
        </mat-form-field>

        <!-- Date -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          @if (form.get('date')?.errors?.['required'] && form.get('date')?.touched) {
            <mat-error>Date is required</mat-error>
          }
        </mat-form-field>

        <!-- Notes -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes (Optional)</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <button mat-stroked-button type="button" (click)="onCancel()">
            <mat-icon>close</mat-icon>
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || form.pristine">
            <mat-icon>save</mat-icon>
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;
  categories$: Observable<IExpenseCategory[]>;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<ExpenseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {
    this.categories$ = this.store.select(selectCategories);
    this.isEditMode = !!data?.expense;
    
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: ['EXPENSE', Validators.required],
      category: [null, Validators.required],
      date: [new Date(), Validators.required],
      notes: [''],
    });

    if (this.isEditMode && data.expense) {
      this.initializeFormWithExpense(data.expense);
    }
  }

  ngOnInit() {
    this.store.dispatch(ExpensesActions.loadCategories());
  }

  private initializeFormWithExpense(expense: IExpense) {
    this.form.patchValue({
      name: expense.name,
      amount: expense.amount,
      type: expense.type,
      category: expense.category,
      date: DateTime.fromISO(expense.date).toJSDate(),
      notes: expense.notes,
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const expenseData = {
        name: formValue.name,
        amount: Number(formValue.amount),
        type: formValue.type,
        category: formValue.category,
        date: DateTime.fromJSDate(formValue.date).toUTC().toISO() as string,
        notes: formValue.notes,
      };

      if (this.isEditMode && this.data?.expense) {
        this.store.dispatch(
          ExpensesActions.updateExpense({
            id: this.data.expense.id,
            expense: expenseData,
          })
        );
      } else {
        this.store.dispatch(
          ExpensesActions.createExpense({
            expense: expenseData,
          })
        );
      }

      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}