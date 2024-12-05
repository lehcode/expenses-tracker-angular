import { KVNamespace } from '@cloudflare/workers-types'

import { IExpense, IExpenseCategory } from '../../../src/app/interfaces/expenses.interfaces'
import categoriesKV from "../../../src/mocks/categories-mocks.json"
import expensesKV from "../../../src/mocks/expenses-mocks.json"
import { corsHeaders } from '../../constants'

const MOCK_EXPENSES = expensesKV.map((item: { value: IExpense }) => item.value as IExpense);
const MOCK_CATEGORIES = categoriesKV.value.map((cat: IExpenseCategory) => cat as IExpenseCategory);

export const onRequest = async (context: { env: { EXPENSES_KV: KVNamespace } }): Promise<Response> => {
  const { env } = context
  const { EXPENSES_KV } = env

  try {
    // Validate KV binding
    if (!EXPENSES_KV) {
      return new Response(
        JSON.stringify({ error: 'Storage service is not available' }),
        { 
          status: 500,
          headers: { ...corsHeaders }
        }
      )
    }

    // Check if data already exists
    const expensesList = await EXPENSES_KV.list()
    if (expensesList.keys.length > 0) {
      return new Response(
        JSON.stringify({ message: 'KV already contains data. Skipping seed.' }),
        { 
          status: 200,
          headers: { ...corsHeaders }
        }
      )
    }

    // Store expenses individually with their IDs as keys
    for (const expense of MOCK_EXPENSES) {
      await EXPENSES_KV.put(`expense:${expense.id}`, JSON.stringify(expense))
    }

    // Store all expenses IDs in a list for easy retrieval
    await EXPENSES_KV.put('expense_ids', JSON.stringify(
      MOCK_EXPENSES.map(expense => expense.id)
    ))

    // Store categories
    await EXPENSES_KV.put('categories', JSON.stringify(MOCK_CATEGORIES))

    return new Response(
      JSON.stringify({ 
        message: 'KV seeded successfully',
        expensesCount: MOCK_EXPENSES.length,
        categoriesCount: MOCK_CATEGORIES.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to seed KV',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders }
      }
    )
  }
}