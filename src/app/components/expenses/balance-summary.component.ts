import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import { selectTotalBalance, selectTotalExpenses, selectTotalIncome } from '../../store/selectors/expenses.selectors'

@Component({
  selector: 'app-balance-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-4 mb-4">
      <!-- Total Balance -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex-grow">
        <div class="flex justify-between items-baseline">
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Total Balance</p>
          <span [class]="(balance$ | async)! >= 0 ? 'text-emerald-500' : 'text-rose-500'" class="text-2xl font-semibold">
            {{ balance$ | async | currency:'USD':'symbol':'1.2-2' }}
          </span>
        </div>
      </div>

      <!-- Total Income -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex-grow">
        <div class="flex justify-between items-baseline">
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Total Income</p>
          <span class="text-2xl font-semibold text-emerald-500">
            {{ income$ | async | currency:'USD':'symbol':'1.2-2' }}
          </span>
        </div>
      </div>

      <!-- Total Expenses -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex-grow">
        <div class="flex justify-between items-baseline">
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Total Expenses</p>
          <span class="text-2xl font-semibold text-rose-500">
            {{ expenses$ | async | currency:'USD':'symbol':'1.2-2' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class BalanceSummaryComponent {
  balance$: Observable<number>
  income$: Observable<number>
  expenses$: Observable<number>

  constructor(private store: Store) {
    this.balance$ = this.store.select(selectTotalBalance)
    this.income$ = this.store.select(selectTotalIncome)
    this.expenses$ = this.store.select(selectTotalExpenses)
  }
}