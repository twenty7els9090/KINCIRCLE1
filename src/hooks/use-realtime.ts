'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface RealtimeConfig {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealtime(config: RealtimeConfig) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channelName = `${config.table}-changes-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && config.onInsert) {
            config.onInsert(payload.new)
          } else if (payload.eventType === 'UPDATE' && config.onUpdate) {
            config.onUpdate(payload.new)
          } else if (payload.eventType === 'DELETE' && config.onDelete) {
            config.onDelete(payload.old)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [config.table, config.event, config.filter])

  return channelRef
}
