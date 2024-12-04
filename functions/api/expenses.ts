// import { KVNamespace } from '@cloudflare/workers-types'

import { Env } from '../../src/app/interfaces/env.interface'
import { corsHeaders as baseHeaders } from '../constants'

export const onRequest = async (context: { request: Request; env: Env; params: any }) => {
  const { request, env } = context

  const corsHeaders = {
    ...baseHeaders,
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No content for OPTIONS
      headers: corsHeaders,
    })
  }

  console.log("Env:", env)

  // Validate KV binding
  if (!env?.EXPENSES_KV) {
    console.error('EXPENSES_KV binding is not available:', env)
    return new Response(
      JSON.stringify({
        error: 'Storage service is not available',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }

  try {
    // Add Content-Type header for JSON responses
    const jsonHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
    }

    switch (request.method) {
      case 'GET': {
        const expensesJson = await env.EXPENSES_KV.get('expenses')
        return new Response(expensesJson || '[]', {
          headers: jsonHeaders,
        })
      }

      case 'POST': {
        const newBook = await request.json()
        const expensesJson = await env.EXPENSES_KV.get('expenses')
        const expenses = expensesJson ? JSON.parse(expensesJson) : []

        const itemWithId = {
          ...newBook,
          id: Date.now(),
        }

        expenses.push(itemWithId)
        await env.EXPENSES_KV.put('expenses', JSON.stringify(expenses))

        return new Response(JSON.stringify(itemWithId), {
          status: 201,
          headers: jsonHeaders,
        })
      }

      case 'DELETE': {
        /* Workaround for Cloudflare request limitations for OPTIONS, PUT, and DELETE.
         * DELETE requests are processed in functions/_middleware.ts
         */
        break
      }

      case 'PUT': {
        /* Workaround for Cloudflare request limitations for OPTIONS, PUT, and DELETE.
         * PUT requests are processed in functions/_middleware.ts
         */
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: jsonHeaders,
        })
    }
  } catch (error: any) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
