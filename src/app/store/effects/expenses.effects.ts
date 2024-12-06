import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, concatMap, map, of, switchMap, tap, withLatestFrom } from 'rxjs'

import { ExpensesService } from '../../services/expenses.service'
import { ExpensesActions } from '../actions/expenses.actions'
import { selectFilters } from '../selectors/expenses.selectors'

@Injectable()
export class ExpensesEffects {
  /**
   * Constructs an instance of ExpensesEffects.
   * 
   * @param actions$ - Observable stream of dispatched actions.
   * @param expensesService - Service to interact with expense-related API endpoints.
   * @param store - NgRx store to select and dispatch actions.
   * @param snackBar - Material service to display notifications.
   */
  constructor(
    private actions$: Actions,
    private expensesService: ExpensesService,
    private store: Store,
    private snackBar: MatSnackBar
  ) {}

  // Load Expenses
  loadExpenses$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.loadExpenses),
      withLatestFrom(this.store.select(selectFilters)),
      switchMap(([action, storeFilters]) =>
        this.expensesService.getExpenses({ ...storeFilters, ...action.filters }).pipe(
          map(expenses => ExpensesActions.loadExpensesSuccess({ expenses })),
          catchError(error => of(ExpensesActions.loadExpensesFailure({ error: error.message })))
        )
      )
    )
  })

  // Load single expense item
  loadExpenseById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.loadExpenseById),
      switchMap(action =>
        this.expensesService.getExpenseById(action.id).pipe(
          map(expense => ExpensesActions.loadExpenseByIdSuccess({ expense })),
          catchError(error => of(ExpensesActions.loadExpenseByIdFailure({ error: error.message })))
        )
      )
    )
  })

  // Load Categories
  loadCategories$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.loadCategories),
      switchMap(() =>
        this.expensesService.getCategories().pipe(
          map(categories => ExpensesActions.loadCategoriesSuccess({ categories })),
          catchError(error => of(ExpensesActions.loadCategoriesFailure({ error: error.message })))
        )
      )
    )
  })

  // Create Expense
  createExpense$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.createExpense),
      concatMap(action =>
        this.expensesService.createExpense(action.expense).pipe(
          map(expense => ExpensesActions.createExpenseSuccess({ expense })),
          catchError(error => of(ExpensesActions.createExpenseFailure({ error: error.message })))
        )
      )
    )
  })

  // Update Expense
  updateExpense$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.updateExpense),
      concatMap(action =>
        this.expensesService.updateExpense(action.id, action.expense).pipe(
          map(expense => ExpensesActions.updateExpenseSuccess({ expense })),
          catchError(error => of(ExpensesActions.updateExpenseFailure({ error: error.message })))
        )
      )
    )
  })

  // Delete Expense
  deleteExpense$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.deleteExpense),
      concatMap(action =>
        this.expensesService.deleteExpense(action.id).pipe(
          map(() => ExpensesActions.deleteExpenseSuccess({ id: action.id })),
          catchError(error => of(ExpensesActions.deleteExpenseFailure({ error: error.message })))
        )
      )
    )
  })

  // Load Summary
  // loadSummary$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ExpensesActions.loadSummary),
  //     withLatestFrom(this.store.select(selectFilters)),
  //     switchMap(([action, storeFilters]) =>
  //       this.expensesService.getSummary({ ...storeFilters, ...action.filters }).pipe(
  //         map(summary => ExpensesActions.loadSummarySuccess({ summary })),
  //         catchError(error => of(ExpensesActions.loadSummaryFailure({ error: error.message })))
  //       )
  //     )
  //   )
  // })

  // Create Category
  createCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExpensesActions.createCategory),
      concatMap(action =>
        this.expensesService.createCategory(action.category).pipe(
          map(category => ExpensesActions.createCategorySuccess({ category })),
          catchError(error => of(ExpensesActions.createCategoryFailure({ error: error.message })))
        )
      )
    )
  })

  // Success Messages
  showSuccessMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ExpensesActions.createExpenseSuccess,
        ExpensesActions.updateExpenseSuccess,
        ExpensesActions.deleteExpenseSuccess,
        ExpensesActions.createCategorySuccess
      ),
      tap(action => {
        let message = ''
        if ('expense' in action) {
          message = `Expense ${action.type.includes('Create') ? 'created' : 'updated'} successfully`
        } else if (action.type.includes('Delete')) {
          message = 'Expense deleted successfully'
        } else if (action.type.includes('Category')) {
          message = 'Category created successfully'
        }
        
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        })
      })
    ),
    { dispatch: false }
  )

  // Error Messages
  showErrorMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ExpensesActions.createExpenseFailure,
        ExpensesActions.updateExpenseFailure,
        ExpensesActions.deleteExpenseFailure,
        ExpensesActions.createCategoryFailure,
        ExpensesActions.loadExpensesFailure,
        ExpensesActions.loadCategoriesFailure,
        ExpensesActions.loadSummaryFailure
      ),
      tap(action => {
        this.snackBar.open(action.error, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        })
      })
    ),
    { dispatch: false }
  )
}