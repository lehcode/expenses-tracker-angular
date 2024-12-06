import { Env } from '../../src/app/interfaces/env.interface'
import { IExpense, IExpenseRow } from '../../src/app/interfaces/expenses.interfaces'
import { corsHeaders } from '../constants'

export const onRequest = async (context: { 
  request: Request
  env: Env
  params: any 
}): Promise<Response> => {
  const { request, env } = context

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization'
      }
    })
  }

  // Validate KV binding
  if (!env?.EXPENSES_KV) {
    return new Response(
      JSON.stringify({ error: 'Storage service is not available' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  try {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const id = pathParts[pathParts.length - 1]
    const isListEndpoint = pathParts[pathParts.length - 1] === 'expenses'

    const jsonHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }

    const now = Date.now()

    switch (request.method) {
      case 'GET': {
        if (isListEndpoint) {
          // Get all expense IDs
          const keysJson = await env.EXPENSES_KV.get('_keys')
          const keys = keysJson ? JSON.parse(keysJson) : []

          // Fetch all expenses
          const expenses = await Promise.all(
            keys.map(async (key: string) => {
              const expenseJson = await env.EXPENSES_KV.get(key)
              return expenseJson ? JSON.parse(expenseJson) : null
            })
          )

          // Filter out any null values from deleted expenses
          const validExpenses = expenses.filter(Boolean)

          return new Response(JSON.stringify(validExpenses), {
            headers: jsonHeaders
          })
        } else {
          // Get single expense
          const expense = await env.EXPENSES_KV.get(`exp_${id}`)
          if (!expense) {
            return new Response(
              JSON.stringify({ error: 'Expense not found' }),
              { status: 404, headers: jsonHeaders }
            )
          }
          return new Response(expense, { headers: jsonHeaders })
        }
      }

      case 'POST': {
        const requestJson = await request.json() as IExpense

        // Get the current list of expense IDs
        const keysJson = await env.EXPENSES_KV.get('_keys')
        const keys = keysJson ? JSON.parse(keysJson) : []
        
        // Determine the next ID by finding the highest current ID and incrementing it
        const keysInt = keys.length > 0 ? keys.map((key: string) => parseInt(key.replace('exp_', ''))) : [0]
        const currentMaxId = Math.max(...keysInt)
        const nextId = currentMaxId + 1
        const nowIso = new Date(now).toISOString()

        const expenseData: IExpenseRow = {
          key: `exp_${nextId}`,
          value: {
            ...requestJson,
            id: nextId,
            createdAt: nowIso,
            updatedAt: nowIso
          }
        }

        try{
          await env.EXPENSES_KV.put(expenseData.key, JSON.stringify({ value: expenseData.value }))

          // Update the list of expense keys
          keys.push(expenseData.key)
          await env.EXPENSES_KV.put('_keys', JSON.stringify(keys))
        } catch (error) {
          console.error(error)
          return new Response(
            JSON.stringify({ error: 'Error storing expense' }),
            { status: 500, headers: jsonHeaders }
          )
        }

        // Store the expense
        return new Response(JSON.stringify(expenseData.value), {
          status: 201,
          headers: jsonHeaders
        })
      }

      case 'PUT': {
        const updates = await request.json()
        
        // Get existing expense
        const existingExpenseJson = await env.EXPENSES_KV.get(`exp_${id}`)
        if (!existingExpenseJson) {
          return new Response(
            JSON.stringify({ error: 'Expense not found' }),
            { status: 404, headers: jsonHeaders }
          )
        }

        const existingExpense = JSON.parse(existingExpenseJson)
        const updatedAt = new Date(now).toISOString()
        const updatedExpense = { ...existingExpense, ...updates, updatedAt }
        
        // Store updated expense
        await env.EXPENSES_KV.put(`exp_${id}`, JSON.stringify(updatedExpense))

        return new Response(JSON.stringify(updatedExpense), {
          headers: jsonHeaders
        })
      }

      case 'DELETE': {
        // Delete the expense
        await env.EXPENSES_KV.delete(`exp_${id}`)

        // Update the list of expense IDs
        const keysJson = await env.EXPENSES_KV.get('_keys')
        if (keysJson) {
          const keys = JSON.parse(keysJson)
          const updatedKeys = keys.filter((key: string) => key.replace('exp_', '') !== id)
          await env.EXPENSES_KV.put('_keys', JSON.stringify(updatedKeys))
        }

        return new Response(null, {
          status: 204,
          headers: corsHeaders
        })
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: jsonHeaders }
        )
    }
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}