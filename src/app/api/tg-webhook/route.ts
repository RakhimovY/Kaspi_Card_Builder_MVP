import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Логируем входящее сообщение для отладки
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));
    
    // Простая обработка сообщений
    const message = body.message;
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.toLowerCase();
      
      let responseText = '';
      
      if (text.includes('привет') || text.includes('hello') || text.includes('салем')) {
        responseText = 'Привет! 👋 Добро пожаловать в Kaspi Card Builder!';
      } else if (text.includes('помощь') || text.includes('help') || text.includes('көмек')) {
        responseText = `🤖 Kaspi Card Builder Bot

Доступные команды:
/start - Начать работу
/help - Показать помощь
/status - Статус сервиса
/pricing - Информация о тарифах

Сайт: https://kaspi-card-builder.com
Поддержка: @kaspi_card_builder`;
      } else if (text.includes('статус') || text.includes('status')) {
        responseText = '✅ Сервис работает нормально! Все системы функционируют.';
      } else if (text.includes('тариф') || text.includes('pricing') || text.includes('баға')) {
        responseText = `💰 Тарифы Kaspi Card Builder:

🆓 Бесплатный план:
• До 50 фото/месяц
• Базовая обработка
• Экспорт ZIP/CSV

💎 Pro план (9,900 ₸/месяц):
• До 500 фото/месяц
• Расширенные функции
• Приоритетная поддержка

Подробнее: https://kaspi-card-builder.com/pricing`;
      } else if (text.includes('start') || text === '/start') {
        responseText = `🚀 Добро пожаловать в Kaspi Card Builder!

Я помогу вам создать профессиональные карточки товаров для Kaspi Marketplace.

Основные возможности:
📸 Автоматическое удаление фона
✍️ Генерация описаний
📦 Экспорт в нужном формате

Начните работу: https://kaspi-card-builder.com/studio

Напишите /help для получения справки.`;
      } else {
        responseText = 'Поздравляем, скоро! 🎉\n\nБот находится в разработке. Пока что вы можете использовать веб-версию: https://kaspi-card-builder.com';
      }
      
      // Отправляем ответ в Telegram
      const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'HTML',
        }),
      });
      
      if (!telegramResponse.ok) {
        console.error('Failed to send Telegram message:', await telegramResponse.text());
      }
    }
    
    // Отвечаем Telegram API
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint is active',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
