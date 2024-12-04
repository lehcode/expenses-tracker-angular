import { IExpense } from "../src/app/interfaces/expenses.interfaces"

import { corsHeaders } from "./constants"

export async function errorHandling(context) {
  try {
    // Log incoming request details
    // console.log('Incoming Request: _middleware.ts log', {
    //   method: context.request.method,
    //   url: context.request.url,
    //   headers: Object.fromEntries(context.request.headers.entries()),
    //   hasKV: !!context.env.EXPENSES_KV
    // })

    const { request, env } = context

    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      return new Response(null, {
        status: 204, // No content for OPTIONS
        headers: {
          'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    }

    try {
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/').filter(Boolean)
      const id = pathSegments[pathSegments.length - 1]

      const jsonHeaders = {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }

      switch (request.method) {
        case 'DELETE': {
          if (!id) {
            return new Response(JSON.stringify({ error: 'Expense ID required' }), {
              status: 400,
              headers: jsonHeaders
            })
          }

          const expensesJson = await env.EXPENSES_KV.get('expenses')
          const expenses = expensesJson ? JSON.parse(expensesJson) : []

          const bookExists = expenses.some((expense: IExpense) => expense.id === parseInt(id))
          if (!bookExists) {
            return new Response(JSON.stringify({ error: 'Record not found' }), {
              status: 404,
              headers: jsonHeaders
            })
          }

          const filteredBooks = expenses.filter((expense: IExpense) => expense.id !== parseInt(id))
          await env.EXPENSES_KV.put('expenses', JSON.stringify(filteredBooks))

          return new Response(null, {
            status: 204,
            headers: corsHeaders // No Content-Type needed for 204
          })
        }

        case 'PUT': {
          if (!id) {
            return new Response(JSON.stringify({ error: 'Expense ID is required' }), {
              status: 400,
              headers: jsonHeaders
            })
          }

          const itemToUpdate = await request.json()
          const expensesJson = await env.EXPENSES_KV.get('expenses')
          const expenses = expensesJson ? JSON.parse(expensesJson) : []

          const itemIndex = expenses.findIndex((expense: IExpense) => expense.id === parseInt(id))
          if (itemIndex === -1) {
            return new Response(JSON.stringify({ error: 'Record not found' }), {
              status: 404,
              headers: jsonHeaders
            })
          }

          const updatedItem = { ...itemToUpdate, id: parseInt(id) }
          expenses[itemIndex] = updatedItem
          await env.EXPENSES_KV.put('expenses', JSON.stringify(expenses))

          return new Response(JSON.stringify(updatedItem), {
            status: 200,
            headers: jsonHeaders
          })
        }

        default:
        // Important: Always return the result of context.next()
        return await context.next()

      }
    } catch (kvError) {
      console.error('KV Error:', kvError)
    }
  } catch (err) {
    console.error('Middleware Error:', err)

    // Return a proper error response with CORS headers
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
  }
}

export const onRequest = [errorHandling]
