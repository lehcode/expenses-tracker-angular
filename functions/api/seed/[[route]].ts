import { KVNamespace } from '@cloudflare/workers-types'

import { IExpenseCategoryRow, IExpenseRow } from '../../../src/app/interfaces/expenses.interfaces'
import categoriesKV from '../../../src/mocks/categories-mocks.json'
import expensesKV from '../../../src/mocks/expenses-mocks.json'
import { corsHeaders } from '../../constants'

const MOCK_EXPENSES = expensesKV.map((expense: IExpenseRow) => expense)
const MOCK_CATEGORIES = categoriesKV.map((category: IExpenseCategoryRow) => category)

export const onRequest = async (context: { env: { EXPENSES_KV: KVNamespace } }): Promise<Response> => {
  const { env } = context
  const { EXPENSES_KV } = env

  try {
    if (!EXPENSES_KV) {
      return new Response(JSON.stringify({ error: 'Storage service is not available' }), {
        status: 500,
        headers: { ...corsHeaders },
      })
    }

    const expensesList = await EXPENSES_KV.list()

    if (expensesList.keys.length > 0) {
      return new Response(JSON.stringify({ message: 'KV already contains data. Skipping seed.' }), {
        status: 200,
        headers: { ...corsHeaders },
      })
    }

    for (const expense of MOCK_EXPENSES) {
      await EXPENSES_KV.put(`exp_${expense.value.id}`, JSON.stringify(expense))
    }

    // Store all expenses IDs in a list for easy retrieval
    await EXPENSES_KV.put('_keys', JSON.stringify(MOCK_EXPENSES.map((expense) => `exp_${expense.value.id}`)))

    // Store categories
    for (const category of MOCK_CATEGORIES) {
      await EXPENSES_KV.put(`cat_${category.value.id}`, JSON.stringify(category))
    }

    return new Response(
      JSON.stringify({
        message: 'KV seeded successfully',
        expensesCount: MOCK_EXPENSES.length,
        categoriesCount: MOCK_CATEGORIES.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders },
      },
    )
  } catch (error) {
    console.error('Seed error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to seed KV',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders },
      },
    )
  }
}
