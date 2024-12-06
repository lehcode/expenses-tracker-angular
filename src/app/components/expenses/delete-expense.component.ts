import { CommonModule } from '@angular/common'
import { Component, Inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'

import { IExpense } from '../../interfaces/expenses.interfaces'

@Component({
  selector: 'app-delete-expense-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Record</h2>
    <mat-dialog-content> Are you sure you want to delete "{{ selected.name }}"? </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteExpenseDialogComponent {
  selected: IExpense

  constructor(
    public dialogRef: MatDialogRef<DeleteExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selected: IExpense },
  ) {
    this.selected = data.selected
  }
}
