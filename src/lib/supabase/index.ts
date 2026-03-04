// Client-side exports (safe for 'use client' components)
export { createClient, getSupabaseClient } from './client'
export * from './database.types'

// Server-side exports - import directly from './server' in API routes only
// Do NOT export server functions here to avoid client bundle issues
