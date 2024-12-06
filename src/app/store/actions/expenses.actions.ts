import { createActionGroup, emptyProps, props } from '@ngrx/store'

import { IExpense, IExpenseCategory, IExpenseFilters, IExpenseSummary } from '../../interfaces/expenses.interfaces'

export const ExpensesActions = createActionGroup({
  source: 'Expenses',
  events: {
    // Load Expenses
    'Load Expenses': props<{ filters?: IExpenseFilters }>(),
    'Load Expenses Success': props<{ expenses: IExpense[] }>(),
    'Load Expenses Failure': props<{ error: string }>(),

    // Single item
    'Load Expense By Id': props<{ id: string }>(),
    'Load Expense By Id Success': props<{ expense: IExpense }>(),
    'Load Expense By Id Failure': props<{ error: string }>(),

    // Load Categories
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: IExpenseCategory[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    // Create Expense
    'Create Expense': props<{ expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'> }>(),
    'Create Expense Success': props<{ expense: IExpense }>(),
    'Create Expense Failure': props<{ error: string }>(),

    // Update Expense
    'Update Expense': props<{ id: number; expense: Partial<IExpense> }>(),
    'Update Expense Success': props<{ expense: IExpense }>(),
    'Update Expense Failure': props<{ error: string }>(),

    // Delete Expense
    'Delete Expense': props<{ id: number }>(),
    'Delete Expense Success': props<{ id: number }>(),
    'Delete Expense Failure': props<{ error: string }>(),

    // Load Summary
    'Load Summary': props<{ filters?: IExpenseFilters }>(),
    'Load Summary Success': props<{ summary: IExpenseSummary }>(),
    'Load Summary Failure': props<{ error: string }>(),

    // Set Selected Expense
    'Set Selected Expense': props<{ expense: IExpense | null }>(),

    // Set Filters
    'Set Filters': props<{ filters: IExpenseFilters }>(),

    // Create Category
    'Create Category': props<{ category: Omit<IExpenseCategory, 'id'> }>(),
    'Create Category Success': props<{ category: IExpenseCategory }>(),
    'Create Category Failure': props<{ error: string }>(),
  }
})