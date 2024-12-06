import { createReducer, on } from '@ngrx/store'

import { IExpensesState } from '../../interfaces/expenses.interfaces'
import { ExpensesActions } from '../actions/expenses.actions'

const initialState: IExpensesState = {
  expenses: [],
  categories: [],
  filters: {
    sortBy: 'date',
    sortOrder: 'desc'
  },
  summary: null,
  selectedExpense: null,
  loading: false,
  error: null
}

export const expensesReducer = createReducer(
  initialState,

  // Load Expenses
  on(ExpensesActions.loadExpenses, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.loadExpensesSuccess, (state, { expenses }) => ({
    ...state,
    expenses,
    loading: false
  })),
  on(ExpensesActions.loadExpensesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Categories
  on(ExpensesActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false
  })),
  on(ExpensesActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Expense
  on(ExpensesActions.createExpense, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.createExpenseSuccess, (state, { expense }) => ({
    ...state,
    expenses: [...state.expenses, expense],
    loading: false
  })),
  on(ExpensesActions.createExpenseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Expense
  on(ExpensesActions.updateExpense, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.updateExpenseSuccess, (state, { expense }) => ({
    ...state,
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
    loading: false
  })),
  on(ExpensesActions.updateExpenseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Expense
  on(ExpensesActions.deleteExpense, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.deleteExpenseSuccess, (state, { id }) => ({
    ...state,
    expenses: state.expenses.filter(e => e.id !== id),
    loading: false
  })),
  on(ExpensesActions.deleteExpenseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Summary
  on(ExpensesActions.loadSummary, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.loadSummarySuccess, (state, { summary }) => ({
    ...state,
    summary,
    loading: false
  })),
  on(ExpensesActions.loadSummaryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Set Selected Expense
  on(ExpensesActions.setSelectedExpense, (state, { expense }) => ({
    ...state,
    selectedExpense: expense
  })),

  // Set Filters
  on(ExpensesActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters
    }
  })),

  // Create Category
  on(ExpensesActions.createCategory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpensesActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    loading: false
  })),
  on(ExpensesActions.createCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
)