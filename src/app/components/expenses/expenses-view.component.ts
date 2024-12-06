import { animate, query, stagger, style, transition, trigger } from '@angular/animations'
import { CommonModule } from '@angular/common'
import { Component, HostListener, OnInit } from '@angular/core'
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

import { BalanceSummaryComponent } from './balance-summary.component'
import { DeleteExpenseDialogComponent } from './delete-expense-dialog.component'
import { ExpenseFormComponent } from './expense-form.component'
import { ExpensesFilterComponent } from './expenses-filter.component'

@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatIconModule,
    MatProgressSpinnerModule,
    FabMenuComponent,
    ExpensesFilterComponent,
    BalanceSummaryComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <!-- Fixed Header Section -->
      <div class="header-section sticky top-0 bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 py-3">
          <h1 class="text-2xl font-bold">Expenses</h1>
        </div>
        
        <!-- Totals Section - Hidden on Scroll -->
        <div class="container mx-auto px-4" [class.hidden]="isScrolled">
          <app-balance-summary></app-balance-summary>
        </div>

        <!-- Filters Section -->
        <div class="container mx-auto px-4">
          <app-expenses-filter></app-expenses-filter>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 container mx-auto px-4 py-3 overflow-auto">
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
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          *ngIf="(loading$ | async) === false"
          [@staggerAnimation]="(expenses$ | async)?.length"
        >
          <!-- Expense Cards -->
          <div *ngFor="let row of expenses$ | async; let i = index" class="w-full mb-4 col-span-4" [@cardAnimation]>
            <div class="cursor-pointer hover:shadow-lg transition-shadow">
              <mat-card
                class="expense-card relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
                [class.selected]="selectedRow?.id === row.id"
                (click)="selectRow(row)"
                (keyup.enter)="selectRow(row)"
                tabindex="i"
                [ngStyle]="{ 'border-left': '4px solid ' + row.category.color }"
              >
                <mat-card-content class="p-4">
                  <!-- Category -->
                  <p class="text-sm text-gray-600 mb-1">{{ row.category.name }}</p>
                  <!-- Name and Amount on same line -->
                  <div class="flex justify-between items-center gap-4 mb-1">
                    <h3 class="text-2xl font-normal truncate">{{ row.name }}</h3>
                    <span
                      [ngClass]="row.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'"
                      class="text-xl whitespace-nowrap"
                    >
                      {{ row.type === 'EXPENSE' ? '- ' : '+ ' }}{{ row.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </span>
                  </div>
                  <!-- Date -->
                  <p class="text-sm text-gray-600">{{ row.date | date: 'mediumDate' }}</p>
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
      .header-section {
        z-index: 65535;
        background: #F9FAFB;
      }
    `,
  ],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('400ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 1, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(30px)' }),
            stagger('100ms', [animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class ExpensesViewComponent implements OnInit {
  expenses$: Observable<IExpense[]>
  loading$ = this.store.select(selectExpensesLoading)
  error$ = this.store.select(selectExpensesError)
  isScrolled = false

  title = 'Expenses'
  selectedRow: IExpense | null = null

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 100
  }

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

  openEditDialog(expense: IExpense): void {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      data: {
        expense: expense,
        isEditMode: true,
      },
      width: '600px',
      disableClose: true,
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ExpensesActions.loadExpenses({}))
        this.selectedRow = null
      }
    })
  }

  openDeleteDialog(expense: IExpense): void {
    const dialogRef = this.dialog.open(DeleteExpenseDialogComponent, {
      data: { expense },
      width: '500px',
      disableClose: true,
      panelClass: 'confirm-dialog-container',
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ExpensesActions.deleteExpense({ id: result.id }))
        this.selectedRow = null
      }
    })
  }
}