import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { DateTime } from 'luxon'
import { catchError, map, Observable, throwError } from 'rxjs'

import { environment } from '../../environments/environment'
import { IExpense, IExpenseCategory, IExpenseFilters, IExpenseRow, IExpenseSummary } from '../interfaces/expenses.interfaces'
import { filterByCategory } from '../shared/methods'

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  getSummary(arg0: { search?: string; category?: string; type?: string; dateRange?: { start?: string; end?: string }; sortBy?: "date" | "amount"; sortOrder?: "asc" | "desc" }): Observable<IExpenseSummary> {
    throw new Error('Method not implemented.')
  }
  private readonly apiUrl = `${environment.apiUrl}`

  constructor(private http: HttpClient) {}

  getExpenses(filters?: IExpenseFilters): Observable<IExpense[]> {
    return this.http.get<IExpenseRow[]>(`${this.apiUrl}/expenses`).pipe(
      map(expenses => this.filterExpenses(expenses, filters)),
      map(expenses => this.transformExpenses(expenses)),
      catchError(this.handleError)
    )
  }

  getExpenseById(id: string): Observable<IExpense> {
    return this.http.get<IExpense>(`${this.apiUrl}/expenses/${id}`).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  createExpense(expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>): Observable<IExpense> {
    const now = DateTime.now().toUTC()
    const newExpense = {
      ...expense,
      id: `exp_${now.toMillis()}`,
      createdAt: now.toISO(),
      updatedAt: now.toISO()
    }

    return this.http.post<IExpense>(`${this.apiUrl}/expenses`, newExpense).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  updateExpense(id: number, expense: Partial<IExpense>): Observable<IExpense> {
    const updatedExpense = {
      ...expense,
      updatedAt: DateTime.now().toUTC().toISO()
    }

    return this.http.put<IExpense>(`${this.apiUrl}/expenses/${id}`, updatedExpense).pipe(
      map(expense => this.transformExpense(expense)),
      catchError(this.handleError)
    )
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  getCategories(): Observable<IExpenseCategory[]> {
    return this.http.get<IExpenseCategory[]>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    )
  }

  createCategory(category: Omit<IExpenseCategory, 'id'>): Observable<IExpenseCategory> {
    const newCategory = {
      ...category,
      id: `cat_${DateTime.now().toMillis()}`
    }

    return this.http.post<IExpenseCategory>(`${this.apiUrl}/categories`, newCategory).pipe(
      catchError(this.handleError)
    )
  }

  private filterExpenses(expenses: IExpenseRow[], filters?: IExpenseFilters): IExpense[] {
    const mapped = expenses.map(expense => expense.value)

    if (!filters) return mapped

    let filtered = [...mapped]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(searchLower) ||
        expense.notes?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.category) {
      filtered = filtered.filter(expense => filterByCategory(expense, filters.category));
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
      date: DateTime.fromISO(expense.date).toUTC().toISO(),
      createdAt: DateTime.fromISO(expense.createdAt).toUTC().toISO(),
      updatedAt: DateTime.fromISO(expense.updatedAt).toUTC().toISO()
    } as IExpense
  }

  /**
   * Takes an array of expenses and transforms each expense by converting
   * the date, createdAt, and updatedAt fields to UTC ISO strings.
   * 
   * @param expenses The array of expenses to transform.
   * @returns The transformed array of expenses.
   */
  private transformExpenses(expenses: IExpense[]): IExpense[] {
    return expenses.map(expense => this.transformExpense(expense))
  }

  private handleError(error: any) {
    console.error('API Error:', error)
    return throwError(() => new Error(error.message || 'An error occurred while processing your request.'))
  }
}