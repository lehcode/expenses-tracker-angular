import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { DateTime } from 'luxon'
import { catchError, map, Observable, throwError } from 'rxjs'

import { environment } from '../../environments/environment'
import { IExpense, IExpenseCategory, IExpenseFilters, IExpenseSummary } from '../interfaces/expenses.interfaces'

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private readonly apiUrl = `${environment.apiUrl}`
  private readonly EXPENSES_KEY = 'expenses'
  private readonly CATEGORIES_KEY = 'categories'

  constructor(private http: HttpClient) {}

  // Expense Operations
  getExpenses(filters?: IExpenseFilters): Observable<IExpense[]> {
    return this.http.get<IExpense[]>(`${this.apiUrl}/${this.EXPENSES_KEY}`).pipe(
      map(expenses => this.filterExpenses(expenses, filters)),
      map(expenses => this.transformExpenses(expenses)),
      catchError(this.handleError)
    )
  }

  getExpenseById(id: string): Observable<IExpense> {
    return this.http.get<IExpense>(`${this.apiUrl}/${this.EXPENSES_KEY}/${id}`).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  createExpense(expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>): Observable<IExpense> {
    const now = DateTime.now()
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: now.toISO(),
      updatedAt: now.toISO()
    }

    return this.http.post<IExpense>(`${this.apiUrl}/${this.EXPENSES_KEY}`, newExpense).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  updateExpense(id: string, expense: Partial<IExpense>): Observable<IExpense> {
    const updatedExpense = {
      ...expense,
      updatedAt: DateTime.now().toISO()
    }

    return this.http.patch<IExpense>(`${this.apiUrl}/${this.EXPENSES_KEY}/${id}`, updatedExpense).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.EXPENSES_KEY}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  // Category Operations
  getCategories(): Observable<IExpenseCategory[]> {
    return this.http.get<IExpenseCategory[]>(`${this.apiUrl}/${this.CATEGORIES_KEY}`).pipe(
      catchError(this.handleError)
    )
  }

  createCategory(category: Omit<IExpenseCategory, 'id'>): Observable<IExpenseCategory> {
    const newCategory = {
      ...category,
      id: crypto.randomUUID()
    }

    return this.http.post<IExpenseCategory>(`${this.apiUrl}/${this.CATEGORIES_KEY}`, newCategory).pipe(
      catchError(this.handleError)
    )
  }

  // Summary Operations
  getSummary(filters?: IExpenseFilters): Observable<IExpenseSummary> {
    return this.getExpenses(filters).pipe(
      map(expenses => this.calculateSummary(expenses)),
      catchError(this.handleError)
    )
  }

  private calculateSummary(expenses: IExpense[]): IExpenseSummary {
    const income = expenses
      .filter(e => e.type === 'INCOME')
      .reduce((sum, e) => sum + e.amount, 0)

    const expenseTotal = expenses
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0)

    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryId = expense.category.id
      acc[categoryId] = (acc[categoryId] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const recentTransactions = [...expenses]
      .sort((a, b) => 
        DateTime.fromISO(b.date).toMillis() - 
        DateTime.fromISO(a.date).toMillis()
      )
      .slice(0, 5)

    return {
      balance: income - expenseTotal,
      income,
      expenses: expenseTotal,
      categoryTotals,
      recentTransactions
    }
  }

  private filterExpenses(expenses: IExpense[], filters?: IExpenseFilters): IExpense[] {
    if (!filters) return expenses

    let filtered = [...expenses]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(searchLower) ||
        expense.notes?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.category) {
      filtered = filtered.filter(expense => 
        expense.category.id === filters.category
      )
    }

    if (filters.type) {
      filtered = filtered.filter(expense => 
        expense.type === filters.type
      )
    }

    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(expense => {
        const expenseDate = DateTime.fromISO(expense.date)
        const start = filters.dateRange?.start ? 
          DateTime.fromISO(filters.dateRange.start) : 
          DateTime.fromMillis(0)
        const end = filters.dateRange?.end ? 
          DateTime.fromISO(filters.dateRange.end) : 
          DateTime.now()
        
        return expenseDate >= start && expenseDate <= end
      })
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = filters.sortBy === 'date' ? 
          DateTime.fromISO(a.date).toMillis() : 
          a.amount
        const bValue = filters.sortBy === 'date' ? 
          DateTime.fromISO(b.date).toMillis() : 
          b.amount
        
        return filters.sortOrder === 'asc' ? 
          aValue - bValue : 
          bValue - aValue
      })
    }

    return filtered
  }

  private transformExpense(expense: IExpense): IExpense {
    return {
      ...expense,
      date: DateTime.fromISO(expense.date).toISO(),
      createdAt: DateTime.fromISO(expense.createdAt).toISO(),
      updatedAt: DateTime.fromISO(expense.updatedAt).toISO()
    } as IExpense
  }

  private transformExpenses(expenses: IExpense[]): IExpense[] {
    return expenses.map(expense => this.transformExpense(expense))
  }

  private handleError(error: any) {
    console.error('An error occurred:', error)
    return throwError(() => new Error(error.message || 'An error occurred while processing your request.'))
  }
}