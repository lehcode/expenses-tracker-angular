import { ExpensesItem } from "../app/interfaces/expenses.interfaces";

import expensesKV from "./expenses-mocks-kv.json";


export const MOCK_EXPENSES = expensesKV.map((pair) => (JSON.parse(pair.value) as ExpensesItem) || pair.value);

