import { Routes } from '@angular/router'

export const EXPENSES_ROUTES: Routes = [
  {
    path: 'expenses',
    children: [
      {
        path: '',
        loadComponent: () => import('../components/expenses/expenses-view.component').then(m => m.ExpensesViewComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('../pages/edit-expense/edit-expense.page').then(m => m.ExpenseFormPageComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('../pages/edit-expense/edit-expense.page').then(m => m.ExpenseFormPageComponent)
      }
    ]
  }
]