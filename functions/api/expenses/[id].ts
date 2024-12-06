import { KVNamespace } from '@cloudflare/workers-types'

import { corsHeaders } from '../../constants'

export const onRequest = async (context: { 
  request: Request
  env: { EXPENSES_KV: KVNamespace }
  params: { id: string }
}) => {
  const { request, env, params } = context
  const { id } = params

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization'
      }
    })
  }

  const jsonHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

  try {
    switch (request.method) {
      case 'GET': {
        const expense = await env.EXPENSES_KV.get(`exp_${id}`)
        if (!expense) {
          return new Response(
            JSON.stringify({ error: 'Expense not found' }),
            { status: 404, headers: jsonHeaders }
          )
        }
        return new Response(expense, { headers: jsonHeaders })
      }

      case 'PUT': {
        const updates = await request.json()
        const existingExpenseJson = await env.EXPENSES_KV.get(`exp_${id}`)
        
        if (!existingExpenseJson) {
          return new Response(
            JSON.stringify({ error: 'Expense not found' }),
            { status: 404, headers: jsonHeaders }
          )
        }

        const existingExpense = JSON.parse(existingExpenseJson)
        const updatedExpense = {
          ...existingExpense,
          ...updates,
          updatedAt: new Date().toISOString()
        }

        await env.EXPENSES_KV.put(`exp_${id}`, JSON.stringify(updatedExpense))
        return new Response(JSON.stringify(updatedExpense), { headers: jsonHeaders })
      }

      case 'DELETE': {
        // Delete the expense
        await env.EXPENSES_KV.delete(`exp_${id}`)

        // Update the list of expense keys
        const keysJson = await env.EXPENSES_KV.get('_keys')
        if (keysJson) {
          const keys = JSON.parse(keysJson)
          const updatedKeys = keys.filter((key: string) => key !== `exp_${id}`)
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
        headers: jsonHeaders
      }
    )
  }
}