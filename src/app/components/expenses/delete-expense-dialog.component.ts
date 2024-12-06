import { CommonModule } from '@angular/common'
import { Component, Inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { IExpense } from '../../interfaces/expenses.interfaces'

interface DeleteExpenseDialogData {
  expense: IExpense;
}

@Component({
  selector: 'app-delete-expense-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-semibold mb-4 flex items-center gap-2">
        <mat-icon class="text-red-500">warning</mat-icon>
        Delete Record
      </h2>
      
      <mat-dialog-content>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this record?
        </p>
        
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p class="font-medium">{{ data.expense.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p class="font-medium" [ngClass]="{
                'text-red-500': data.expense.type === 'EXPENSE',
                'text-green-500': data.expense.type === 'INCOME'
              }">
                {{ data.expense.type === 'EXPENSE' ? '-' : '+' }}
                {{ data.expense.amount | currency:'USD':'symbol':'1.2-2' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p class="font-medium">{{ data.expense.category.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p class="font-medium">{{ data.expense.date | date:'mediumDate' }}</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="mt-6 gap-2">
        <button 
          mat-button 
          [mat-dialog-close]="false"
          class="hover:bg-gray-100 dark:hover:bg-gray-700">
          <mat-icon class="mr-2">close</mat-icon>
          Cancel
        </button>
        <button 
          mat-flat-button 
          color="warn"
          [mat-dialog-close]="data.expense"
          class="hover:bg-red-600">
          <mat-icon class="mr-2">delete</mat-icon>
          Delete
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class DeleteExpenseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteExpenseDialogData
  ) {
    if (!data?.expense) {
      console.error('No expense data provided to delete dialog');
      this.dialogRef.close(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}