import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import { IExpense } from '../../interfaces/expenses.interfaces'
import { ExpensesActions } from '../../store/actions/expenses.actions'
import {
  selectExpensesError,
  selectExpensesLoading,
  selectFilteredExpenses,
} from '../../store/selectors/expenses.selectors'
import { FabMenuComponent } from '../nav/fab-menu.component'

import { DeleteExpenseDialogComponent } from './delete-expense.component'
import { ExpenseFormComponent } from './expense-form.component'

@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardContent, MatIconModule, MatProgressSpinnerModule, FabMenuComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <!-- Header Section -->
      <div class="container mx-auto px-4 py-6">
        <div class="bg-white dark:bg-gray-800 shadow-sm">
          <h1 class="text-2xl font-bold">Expenses</h1>
          <!-- <button mat-raised-button color="primary" (click)="onAddNew()">Add New Expense</button> -->
        </div>
      </div>

      <div class="container mx-auto px-4 py-6">
        <!-- Loading State -->
        <div class="flex justify-center p-8" *ngIf="loading$ | async">
          <mat-spinner></mat-spinner>
        </div>

        <!-- Error State -->
        <div
          class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6"
          *ngIf="error$ | async as error"
        >
          {{ error }}
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          *ngIf="(loading$ | async) === false"
        >
          <!-- Expense Card -->
          <div
            *ngFor="let row of expenses$ | async; let i = index"
            class="mb-4"
            [@cardAnimation]
          >
            <div class="cursor-pointer hover:shadow-lg transition-shadow">
              <mat-card
                class="expense-card relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
                [class.selected]="selectedRow?.id === row.id"
                (click)="selectRow(row)"
                (keyup.enter)="selectRow(row)"
                tabindex="i"
              >
                <mat-card-content class="flex justify-between items-center p-4">
                  <div>
                    <h3 class="text-lg font-medium">{{ row.name }}</h3>
                    <p class="text-gray-600">{{ row.date | date }}</p>
                  </div>
                  <div [ngClass]="row.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'">
                    {{ row.type === 'EXPENSE' ? '-' : '+' }} USD{{ row.amount | currency }}
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          class="text-center py-16"
          *ngIf="(loading$ | async) === false && (expenses$ | async)?.length === 0"
          @fadeAnimation
        >
          <mat-icon class="text-6xl text-gray-400 dark:text-gray-600 mb-4"></mat-icon>
          <p class="text-xl text-gray-600 dark:text-gray-300">No records found</p>
        </div>

        <!-- FAB Menu -->
        <app-fab-menu
          [selectedItem]="selectedRow"
          (addItemEvent)="openAddDialog()"
          (editItemEvent)="openEditDialog($event)"
          (deleteItemEvent)="openDeleteDialog($event)"
        >
        </app-fab-menu>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ExpensesViewComponent implements OnInit {
  expenses$: Observable<IExpense[]>
  loading$ = this.store.select(selectExpensesLoading)
  error$ = this.store.select(selectExpensesError)

  title = 'Expenses'
  selectedRow: IExpense | null = null

  /**
   * @constructor
   * @param router - The angular router
   * @param store - The ngrx store
   *
   * This constructor sets up the component to select all expenses from the store
   * when the component is initialized.
   */
  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
  ) {
    this.expenses$ = this.store.select(selectFilteredExpenses)
  }

  ngOnInit() {
    this.store.dispatch(ExpensesActions.loadExpenses({}))
  }

  selectRow(row: IExpense) {
    this.selectedRow = this.selectedRow?.id === row.id ? null : row
    console.log(this.selectedRow)
  }

  onAddNew() {
    this.router.navigate(['/expenses/new'])
  }

  onEdit(expense: IExpense) {
    this.router.navigate(['/expenses/edit', expense.id])
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      disableClose: true,
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ExpensesActions.loadExpenses({}))
      }
    })
  }

  openEditDialog(data: IExpense): void {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      data: { ...data },
      disableClose: true,
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ExpensesActions.loadExpenses({}))
        this.selectedRow = null
      }
    })
  }

  openDeleteDialog(row: IExpense): void {
    const dialogRef = this.dialog.open(DeleteExpenseDialogComponent, {
      data: { ...row },
      // width: '400px',
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ExpensesActions.deleteExpense({ id: result.id }))
        this.selectedRow = null
      }
    })
  }
}
