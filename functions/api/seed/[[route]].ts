import { KVNamespace } from '@cloudflare/workers-types'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

import { IExpense, IExpenseCategory } from '../../../src/app/interfaces/expenses.interfaces'

// Predefined categories with consistent colors
const EXPENSE_CATEGORIES: Omit<IExpenseCategory, 'id'>[] = [
  { name: 'Groceries', type: 'EXPENSE', color: '#10b981' },
  { name: 'Rent', type: 'EXPENSE', color: '#f43f5e' },
  { name: 'Transportation', type: 'EXPENSE', color: '#6366f1' },
  { name: 'Entertainment', type: 'EXPENSE', color: '#8b5cf6' },
  { name: 'Shopping', type: 'EXPENSE', color: '#ec4899' },
  { name: 'Healthcare', type: 'EXPENSE', color: '#14b8a6' },
  { name: 'Utilities', type: 'EXPENSE', color: '#f59e0b' },
  { name: 'Salary', type: 'INCOME', color: '#22c55e' },
  { name: 'Freelance', type: 'INCOME', color: '#3b82f6' },
  { name: 'Investments', type: 'INCOME', color: '#0ea5e9' },
  { name: 'Other Income', type: 'INCOME', color: '#06b6d4' },
]

// Generate categories with IDs
const generateCategories = (): IExpenseCategory[] => {
  return EXPENSE_CATEGORIES.map((category, index) => ({
    ...category,
    id: index + 1,
  }))
}

// Generate a random amount between min and max
const generateAmount = (min: number, max: number): number => {
  return Number(faker.finance.amount({ min, max, dec: 2 }))
}

// Generate a random date within the last year
const generateDate = (): string => {
  const startDate = DateTime.now().minus({ years: 1 })
  const endDate = DateTime.now()

  return faker.date
    .between({
      from: startDate.toJSDate(),
      to: endDate.toJSDate(),
    })
    .toISOString()
}

// Random expenses and incomes
const generateTransactions = (categories: IExpenseCategory[], count: number): IExpense[] => {
  const transactions: IExpense[] = []
  const now = DateTime.now()

  for (let i = 1; i <= count; i++) {
    const category = faker.helpers.arrayElement(categories)
    const isExpense = category.type === 'EXPENSE'

    const amount = isExpense ? generateAmount(10, 1000) : generateAmount(1000, 5000)

    const transaction: IExpense = {
      id: i,
      name: isExpense
        ? faker.helpers.arrayElement([
            `${category.name} at ${faker.company.name()}`,
            `${category.name} - ${faker.commerce.productName()}`,
            `${category.name} payment`,
          ])
        : faker.helpers.arrayElement([
            `${category.name} payment`,
            `${category.name} from ${faker.company.name()}`,
            `Monthly ${category.name}`,
          ]),
      amount,
      type: category.type,
      category,
      date: generateDate(),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }),
      createdAt: now.toISO(),
      updatedAt: now.toISO(),
    }

    transactions.push(transaction)
  }

  // Sort by date
  return transactions.sort((a, b) => DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis())
}

export const onRequest = async (context: { env: { EXPENSES_KV: KVNamespace } }): Promise<Response> => {
  const { env } = context
  const TRANSACTIONS_AMT = 50

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    if (!env.EXPENSES_KV) {
      throw new Error('Storage service is not available')
    }

    // Check if data already exists
    const expensesList = await env.EXPENSES_KV.list()
    if (expensesList.keys.length > 0) {
      return new Response(JSON.stringify({ message: 'KV already contains data. Skipping seed.' }), {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Generate categories and transactions
    const categories = generateCategories()
    const transactions = generateTransactions(categories, TRANSACTIONS_AMT)

    // Store categories
    for (const category of categories) {
      await env.EXPENSES_KV.put(`cat_${category.id}`, JSON.stringify({ value: category }))
    }

    // Store transactions
    const transactionKeys = []
    for (const transaction of transactions) {
      const key = `exp_${transaction.id}`
      await env.EXPENSES_KV.put(key, JSON.stringify({ value: transaction }))
      transactionKeys.push(key)
    }

    // Store transaction keys list
    await env.EXPENSES_KV.put('_keys', JSON.stringify(transactionKeys))

    return new Response(
      JSON.stringify({
        message: 'KV seeded successfully',
        summary: {
          categories: categories.length,
          transactions: transactions.length,
          dateRange: {
            start: transactions[transactions.length - 1].date,
            end: transactions[0].date,
          },
        },
      }),
      { status: 200, headers: corsHeaders },
    )
  } catch (error) {
    console.error('Seed error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to seed KV',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: corsHeaders },
    )
  }
}
