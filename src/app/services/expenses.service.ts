import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { DateTime } from 'luxon'
import { catchError, map, Observable, throwError } from 'rxjs'

import { environment } from '../../environments/environment'
import {
  IExpense,
  IExpenseCategory,
  IExpenseCategoryRow,
  IExpenseFilters,
  IExpenseRow,
} from '../interfaces/expenses.interfaces'
import { filterByCategory } from '../shared/methods'

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly apiUrl = `${environment.apiUrl}`

  constructor(private http: HttpClient) {}

  getExpenses(filters?: IExpenseFilters): Observable<IExpense[]> {
    return this.http.get<IExpenseRow[]>(`${this.apiUrl}/expenses`).pipe(
      map((response) => this.filterExpenses(response, filters)),
      map((expenses) => this.transformMultiple(expenses)),
      catchError(this.handleError),
    )
  }

  getExpenseById(id: string): Observable<IExpense> {
    return this.http.get<IExpense>(`${this.apiUrl}/expenses/${id}`).pipe(
      map((expense) => this.transform(expense)),
      catchError(this.handleError),
    )
  }

  createExpense(expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>): Observable<IExpense> {
    const now = DateTime.now().toUTC()
    const newExpense = {
      ...expense,
      id: `exp_${now.toMillis()}`,
      createdAt: now.toISO(),
      updatedAt: now.toISO(),
    }

    return this.http.post<IExpense>(`${this.apiUrl}/expenses`, newExpense).pipe(
      map((expense) => this.transform(expense)),
      catchError(this.handleError),
    )
  }

  updateExpense(id: number, expense: Partial<IExpense>): Observable<IExpense> {
    const updatedExpense = {
      ...expense,
      updatedAt: DateTime.now().toUTC().toISO(),
    }

    return this.http.put<IExpense>(`${this.apiUrl}/expenses/${id}`, updatedExpense).pipe(
      map((expense) => this.transform(expense)),
      catchError(this.handleError),
    )
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`).pipe(catchError(this.handleError))
  }

  getCategories(): Observable<IExpenseCategory[]> {
    return this.http.get<IExpenseCategoryRow[]>(`${this.apiUrl}/categories`).pipe(
      map((response) => response.map((item) => item.value as IExpenseCategory)),
      catchError(this.handleError),
    )
  }

  createCategory(category: Omit<IExpenseCategory, 'id'>): Observable<IExpenseCategory> {
    const newCategory = {
      ...category,
      id: `cat_${DateTime.now().toMillis()}`,
    }

    return this.http.post<IExpenseCategory>(`${this.apiUrl}/categories`, newCategory).pipe(catchError(this.handleError))
  }

  private filterExpenses(expenses: IExpenseRow[], filters?: IExpenseFilters) {
    if (!filters) return expenses

    let updated = [...expenses]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      updated = updated.filter((expense) => {
        if ('notes' in expense.value) {
          return (
            expense.value.name.toLowerCase().includes(searchLower) ||
            expense.value.notes?.toLowerCase().includes(searchLower)
          )
        } else {
          return expense.value.name.toLowerCase().includes(searchLower)
        }
      })
    }

    if (filters.category) {
      updated = updated.filter((expense) => filterByCategory(expense.value, filters.category))
    }

    if (filters.type) {
      updated = updated.filter((expense) => expense.value.type === filters.type)
    }

    if (filters.dateRange?.start || filters.dateRange?.end) {
      updated = updated.filter((expense: IExpenseRow) => {
        const expenseDate = DateTime.fromISO(expense.value.date)
        const start = filters.dateRange?.start ? DateTime.fromISO(filters.dateRange.start) : DateTime.fromMillis(0)
        const end = filters.dateRange?.end ? DateTime.fromISO(filters.dateRange.end) : DateTime.now()

        return expenseDate >= start && expenseDate <= end
      })
    }

    if (filters.sortBy) {
      updated.sort((a: IExpenseRow, b: IExpenseRow) => {
        const aValue = filters.sortBy === 'date' ? DateTime.fromISO(a.value.date).toMillis() : a.value.amount
        const bValue = filters.sortBy === 'date' ? DateTime.fromISO(b.value.date).toMillis() : b.value.amount

        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      })
    }

    return updated
  }

  private transform(expense: IExpense): IExpense {
    return {
      ...expense,
      date: DateTime.fromISO(expense.date).toUTC().toISO(),
      createdAt: DateTime.fromISO(expense.createdAt).toUTC().toISO(),
      updatedAt: DateTime.fromISO(expense.updatedAt).toUTC().toISO(),
    } as IExpense
  }

  private transformMultiple(expenses: IExpenseRow[]): IExpense[] {
    return expenses.map((expense) => this.transform(expense.value))
  }

  private handleError(error: any) {
    console.error('API Error:', error)
    return throwError(() => new Error(error.message || 'An error occurred while processing your request.'))
  }
}
