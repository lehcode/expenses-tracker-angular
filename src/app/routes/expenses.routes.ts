import { Routes } from "@angular/router"

import { ExpenseFormComponent } from "../components/expenses/expense-form.component"
import { ExpensesViewComponent } from "../components/expenses/expenses-view.component"

export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    component: ExpensesViewComponent, 
  },
  {
    path: ':id',
    component: ExpenseFormComponent,
  },
];