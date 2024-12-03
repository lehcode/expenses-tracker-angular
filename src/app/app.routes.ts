import { Routes } from '@angular/router'


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page'),
  },
  {
    path: 'expenses',
    loadChildren: () => import('./routes/expenses.routes').then(m => m.EXPENSES_ROUTES)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
]
