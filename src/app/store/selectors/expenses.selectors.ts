import { createFeatureSelector, createSelector } from '@ngrx/store'
import { DateTime } from 'luxon'

import { IExpensesState } from '../../interfaces/expenses.interfaces'
import { filterByCategory } from '../../shared/methods'

export const selectExpensesState = createFeatureSelector<IExpensesState>('expenses')

// Basic Selectors
export const selectAllExpenses = createSelector(selectExpensesState, (state) => state.expenses)

export const selectCategories = createSelector(selectExpensesState, (state) => state.categories)

export const selectFilters = createSelector(selectExpensesState, (state) => state.filters)

export const selectSummary = createSelector(selectExpensesState, (state) => state.summary)

export const selectSelectedExpense = createSelector(selectExpensesState, (state) => state.selectedExpense)

export const selectLoading = createSelector(selectExpensesState, (state) => state.loading)

export const selectError = createSelector(selectExpensesState, (state) => state.error)

// Derived Selectors
export const selectFilteredExpenses = createSelector(selectAllExpenses, selectFilters, (expenses, filters) => {
  let filtered = [...expenses]

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (expense) =>
        expense.name.toLowerCase().includes(searchLower) || expense.notes?.toLowerCase().includes(searchLower),
    )
  }

  // Apply category filter
  if (filters.category) {
    filtered = filtered.filter((expense) => filterByCategory(expense, filters.category))
  }

  // Apply type filter
  if (filters.type) {
    filtered = filtered.filter((expense) => expense.type === filters.type)
  }

  // Apply date range filter
  if (filters.dateRange?.start || filters.dateRange?.end) {
    filtered = filtered.filter((expense) => {
      const expenseDate = DateTime.fromISO(expense.date)
      const start = filters.dateRange?.start ? DateTime.fromISO(filters.dateRange.start) : DateTime.fromMillis(0)
      const end = filters.dateRange?.end ? DateTime.fromISO(filters.dateRange.end) : DateTime.now()

      return expenseDate >= start && expenseDate <= end
    })
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aValue = filters.sortBy === 'date' ? DateTime.fromISO(a.date).toMillis() : a.amount
      const bValue = filters.sortBy === 'date' ? DateTime.fromISO(b.date).toMillis() : b.amount

      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
  }

  return filtered
})

export const selectTotalBalance = createSelector(selectAllExpenses, (expenses) =>
  expenses.reduce((total, expense) => {
    return total + (expense.type === 'INCOME' ? expense.amount : -expense.amount)
  }, 0),
)

export const selectTotalIncome = createSelector(selectAllExpenses, (expenses) => {
  const filtered = expenses.filter((expense) => expense.type === 'INCOME')
  return filtered.reduce((total, expense) => total + expense.amount, 0)
})

export const selectTotalExpenses = createSelector(selectAllExpenses, (expenses) => {
  const filtered = expenses.filter((expense) => expense.type === 'EXPENSE')
  return filtered.reduce((total, expense) => total + expense.amount, 0)
}
)

export const selectCategoryTotals = createSelector(selectAllExpenses, selectCategories, (expenses, categories) => {
  const totals: Record<string, number> = {}

  categories.forEach((category) => {
    totals[category.id] = expenses
      .filter((expense) => expense.category.id === category.id)
      .reduce((total, expense) => total + expense.amount, 0)
  })

  return totals
})

export const selectRecentTransactions = createSelector(selectAllExpenses, (expenses) => {
  return [...expenses]
    .sort((a, b) => DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis())
    .slice(0, 5)
})

export const selectExpensesLoading = createSelector(
  selectExpensesState,
  (state: IExpensesState) => state.loading ?? false,
)
export const selectExpensesError = createSelector(selectExpensesState, (state: IExpensesState) => state.error ?? null)
