

export interface IExpense {
  id: number
  name: string
  amount: number
  type: string | 'INCOME' | 'EXPENSE'
  category: IExpenseCategory
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface IExpenseCategory {
  id: number
  name: string
  type: string
  color: string
}

export interface IExpenseFilters {
  search?: string
  category?: string
  type?: string
  dateRange?: {
    start?: string
    end?: string
  }
  sortBy?: 'date' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface IExpenseSummary {
  balance: number
  income: number
  expenses: number
  categoryTotals: Record<string, number>
  recentTransactions: IExpense[]
}

export interface IExpensesState {
  expenses: IExpense[]
  categories: IExpenseCategory[]
  filters: IExpenseFilters
  summary: IExpenseSummary | null
  selectedExpense: IExpense | null
  loading: boolean
  error: string | null
}

export interface IExpenseRow {
  value: IExpense
  metadata: Record<string, string>
}

export interface IExpenseCategoryRow {
  value: IExpenseCategory
  metadata: Record<string, string>
}