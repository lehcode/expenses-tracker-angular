import { Routes } from '@angular/router'

import { AppLayoutComponent } from './app-layout.component'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.default),
    pathMatch: 'full',
  },
  {
    path: 'expenses',
    component: AppLayoutComponent,
    loadChildren: () => import('./routes/expenses.routes').then((m) => m.EXPENSES_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
]
