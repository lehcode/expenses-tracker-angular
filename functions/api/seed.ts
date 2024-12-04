import { KVNamespace } from '@cloudflare/workers-types'

import { MOCK_EXPENSES } from '../../src/mocks/expenses-mocks'

/**
 * Seeds the KV store with mock data if no data exists. Returns a response indicating
 * success or failure.
 *
 * @param context - The context of the request.
 * @returns A Response indicating success or failure of seeding the KV store.
 */
export const onRequest = async (context: { env: { EXPENSES_KV: KVNamespace } }): Promise<Response> => {
  const { env } = context

  try {
    const existingExpenses = JSON.parse(await env.EXPENSES_KV.get('expenses') as string)

    if (existingExpenses?.length === 0) {
      // Initialize with mock data if no records exist
      await env.EXPENSES_KV.put('expenses', JSON.stringify(MOCK_EXPENSES))
      return new Response('KV storage seeded successfully', { status: 200 })
    } else {
      return new Response('Records already seeded in KV storage', { status: 201 })
    }
  } catch (error) {
    return new Response('Failed to seed KV storage: ' + error, { status: 500 })
  }
}
