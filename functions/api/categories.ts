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
    const jsonHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }

    switch (request.method) {
      case 'GET': {
        // List all categories by scanning KV store for cat_ prefix
        const { keys } = await env.EXPENSES_KV.list({ prefix: 'cat_' })
        
        // Fetch all categories
        const categories = await Promise.all(
          keys.map(async (key) => {
            const categoryJson = await env.EXPENSES_KV.get(key.name)
            return categoryJson ? JSON.parse(categoryJson) : null
          })
        )

        // Filter out any null values
        const validCategories = categories.filter(Boolean)

        return new Response(JSON.stringify(validCategories), {
          headers: jsonHeaders
        })
      }

      case 'POST': {
        const category = await request.json()
        const categoryId = category.id

        // Store the category
        await env.EXPENSES_KV.put(`cat_${categoryId}`, JSON.stringify(category))

        return new Response(JSON.stringify(category), {
          status: 201,
          headers: jsonHeaders
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