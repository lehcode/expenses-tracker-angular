import { IExpense } from "../interfaces/expenses.interfaces"

export const filterByCategory = (expense: IExpense, categoryFilter: string | undefined): boolean => {
  if (!categoryFilter) return true;
  return `cat_${expense.category.id}` === categoryFilter;
}