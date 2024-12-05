import { Env } from '../../src/app/interfaces/env.interface'
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

    switch (request.method) {
      case 'GET': {
        if (isListEndpoint) {
          // Get all expense IDs
          const idsJson = await env.EXPENSES_KV.get('expense_ids')
          const ids = idsJson ? JSON.parse(idsJson) : []

          // Fetch all expenses
          const expenses = await Promise.all(
            ids.map(async (expenseId: string) => {
              const expenseJson = await env.EXPENSES_KV.get(`expense:${expenseId}`)
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
          const expense = await env.EXPENSES_KV.get(`expense:${id}`)
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
        const expense = await request.json()
        const expenseId = expense.id

        // Store the expense
        await env.EXPENSES_KV.put(`expense:${expenseId}`, JSON.stringify(expense))

        // Update the list of expense IDs
        const idsJson = await env.EXPENSES_KV.get('expense_ids')
        const ids = idsJson ? JSON.parse(idsJson) : []
        ids.push(expenseId)
        await env.EXPENSES_KV.put('expense_ids', JSON.stringify(ids))

        return new Response(JSON.stringify(expense), {
          status: 201,
          headers: jsonHeaders
        })
      }

      case 'PUT': {
        const updates = await request.json()
        
        // Get existing expense
        const existingExpenseJson = await env.EXPENSES_KV.get(`expense:${id}`)
        if (!existingExpenseJson) {
          return new Response(
            JSON.stringify({ error: 'Expense not found' }),
            { status: 404, headers: jsonHeaders }
          )
        }

        const existingExpense = JSON.parse(existingExpenseJson)
        const updatedExpense = { ...existingExpense, ...updates }
        
        // Store updated expense
        await env.EXPENSES_KV.put(`expense:${id}`, JSON.stringify(updatedExpense))

        return new Response(JSON.stringify(updatedExpense), {
          headers: jsonHeaders
        })
      }

      case 'DELETE': {
        // Delete the expense
        await env.EXPENSES_KV.delete(`expense:${id}`)

        // Update the list of expense IDs
        const idsJson = await env.EXPENSES_KV.get('expense_ids')
        if (idsJson) {
          const ids = JSON.parse(idsJson)
          const updatedIds = ids.filter((expenseId: string) => expenseId !== id)
          await env.EXPENSES_KV.put('expense_ids', JSON.stringify(updatedIds))
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