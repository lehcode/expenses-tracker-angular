import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { MatCard, MatCardContent } from '@angular/material/card'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import { IExpense } from '../../interfaces/expenses.interfaces'
import { ExpensesActions } from '../../store/actions/expenses.actions'
import { selectFilteredExpenses } from '../../store/selectors/expenses.selectors'

@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardContent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Expenses</h1>
        <button mat-raised-button color="primary" (click)="onAddNew()">Add New Expense</button>
      </div>

      <mat-card
        *ngFor="let expense of expenses$ | async"
        class="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
        (click)="onEdit(expense)"
      >
        <mat-card-content class="flex justify-between items-center p-4">
          <div>
            <h3 class="text-lg font-medium">{{ expense.name }}</h3>
            <p class="text-gray-600">{{ expense.date | date }}</p>
          </div>
          <div [ngClass]="expense.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'">
            {{ expense.type === 'EXPENSE' ? '-' : '+' }}{{ expense.amount | currency }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ExpensesViewComponent implements OnInit {
  expenses$: Observable<IExpense[]>

  constructor(
    private router: Router,
    private store: Store,
  ) {
    this.expenses$ = this.store.select(selectFilteredExpenses)
  }

  ngOnInit() {
    this.store.dispatch(ExpensesActions.loadExpenses({}))
  }

  onAddNew() {
    this.router.navigate(['/expenses/new'])
  }

  onEdit(expense: IExpense) {
    this.router.navigate(['/expenses/edit', expense.id])
  }
}
