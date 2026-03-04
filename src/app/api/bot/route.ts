import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
  }
}

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set')
    return
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send Telegram message:', error)
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}

/**
 * POST /api/bot - Handle Telegram bot webhook
 */
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    // Handle /start command
    if (update.message?.text?.startsWith('/start')) {
      const telegramUser = update.message.from
      const chatId = update.message.chat.id
      
      if (telegramUser) {
        const supabase = getSupabaseAdmin()
        
        // Find user by telegram_id and update chat_id
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramUser.id)
          .single()
        
        if (user) {
          // Update chat_id if different
          if (user.chat_id !== chatId) {
            await supabase
              .from('users')
              .update({ chat_id: chatId })
              .eq('id', user.id)
          }
          
          const firstName = user.first_name || telegramUser.first_name
          await sendTelegramMessage(
            chatId,
            `👋 Привет, ${firstName}!\n\nДобро пожаловать в KINCIRCLE! Нажмите кнопку ниже, чтобы открыть приложение.`
          )
        } else {
          await sendTelegramMessage(
            chatId,
            '👋 Добро пожаловать в KINCIRCLE!\n\nОткройте Mini App, чтобы начать использовать приложение.'
          )
        }
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in bot webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST helper function for sending notifications
 * This can be called from other API routes
 */
export async function sendNotification(
  chatId: number,
  type: string,
  data: Record<string, unknown>
) {
  let message = ''
  
  switch (type) {
    case 'friend_request':
      message = `👋 <b>Новый запрос в друзья</b>\n\n${data.senderName} хочет добавить вас в друзья!`
      break
    case 'friend_accepted':
      message = `✅ <b>Запрос принят</b>\n\n${data.receiverName} принял(а) ваш запрос в друзья!`
      break
    case 'family_invite':
      message = `🏠 <b>Приглашение в семью</b>\n\nВас пригласили в семью "${data.familyName}"!`
      break
    case 'new_task':
      message = `📝 <b>Новая задача</b>\n\n${data.title}\n${data.assignedTo ? `Назначено: ${data.assignedTo}` : ''}`
      break
    case 'event_created':
      message = `📅 <b>Новое мероприятие</b>\n\n${data.title}\n${data.date ? `📅 ${data.date}` : ''}${data.location ? `\n📍 ${data.location}` : ''}`
      break
    case 'birthday_reminder':
      message = `🎂 <b>Скоро день рождения!</b>\n\n${data.name} празднует день рождения ${data.date}!`
      break
    case 'wishlist_booked':
      message = `🎁 <b>Подарок забронирован</b>\n\n"${data.itemTitle}" из вашего вишлиста был забронирован!`
      break
    case 'wishlist_cancelled':
      message = `🎁 <b>Бронь отменена</b>\n\nБронь на "${data.itemTitle}" была отменена.`
      break
    default:
      message = `🔔 Уведомление от KINCIRCLE`
  }
  
  await sendTelegramMessage(chatId, message)
}
