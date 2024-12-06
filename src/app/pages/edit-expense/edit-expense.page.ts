import { Component, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Store } from '@ngrx/store'

import { ExpenseFormComponent } from '../../components/expenses/expense-form.component'
import { IExpense } from '../../interfaces/expenses.interfaces'
import { emptyExpense } from '../../shared/hydrate'
import { ExpensesActions } from '../../store/actions/expenses.actions'

@Component({
  selector: 'app-expense-form-page',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ isEditMode ? 'Edit' : 'New' }} Expense</h1>
        <a mat-button routerLink="/expenses" color="primary">
          <mat-icon>list</mat-icon>
          Expenses List
        </a>
      </div>

      <app-expense-form [selectedExpense]="expense" (cancelEdit)="onCancel()"></app-expense-form>
    </div>
  `,
  imports: [ExpenseFormComponent, MatButtonModule, MatIconModule, RouterLink],
  standalone: true,
})
export class ExpenseFormPageComponent implements OnInit {
  isEditMode = false
  expense: Omit<IExpense, 'createdAt' | 'updatedAt'> = emptyExpense

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.isEditMode = true
      this.store.dispatch(ExpensesActions.loadExpenseById({ id }))
    }
  }

  // onSave(expense: Partial<IExpense>) {
  //   if (this.isEditMode && this.expense?.id) {
  //     this.store.dispatch(
  //       ExpensesActions.updateExpense({
  //         id: this.expense.id,
  //         expense,
  //       }),
  //     )
  //   } else {
  //     this.store.dispatch(
  //       ExpensesActions.createExpense({
  //         expense: expense as Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>,
  //       }),
  //     )
  //   }
    
  //   this.router.navigate(['/expenses'])
  // }

  onCancel() {
    this.router.navigate(['/expenses'])
  }
}
