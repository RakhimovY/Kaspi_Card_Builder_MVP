import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '60px',
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '24px',
              lineHeight: 1.1,
            }}
          >
            Trade Card Builder
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#4b5563',
              marginBottom: '32px',
              lineHeight: 1.3,
            }}
          >
            Конструктор карточек товаров для Kaspi.kz
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#6b7280',
              lineHeight: 1.4,
              maxWidth: '700px',
            }}
          >
            Создавайте профессиональные карточки товаров за минуты. 
            ИИ генерация описаний, автозаполнение по штрихкоду, 
            готовый экспорт для маркетплейса.
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: '#f3f4f6',
                padding: '16px 24px',
                borderRadius: '16px',
                fontSize: '18px',
                color: '#374151',
                fontWeight: '600',
              }}
            >
              📱 Сканирование штрихкодов
            </div>
            <div
              style={{
                background: '#f3f4f6',
                padding: '16px 24px',
                borderRadius: '16px',
                fontSize: '18px',
                color: '#374151',
                fontWeight: '600',
              }}
            >
              🤖 ИИ генерация
            </div>
            <div
              style={{
                background: '#f3f4f6',
                padding: '16px 24px',
                borderRadius: '16px',
                fontSize: '18px',
                color: '#374151',
                fontWeight: '600',
              }}
            >
              📤 Экспорт для Kaspi
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
