import { LemonSqueezyTest } from '@/components/LemonSqueezyTest'
import { SubscriptionInfo } from '@/components/SubscriptionInfo'
import { BuyProButton } from '@/components/BuyProButton'

export default function TestMockPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Тест мока покупки Pro</h1>
          <p className="text-lg text-blue-700 mb-6">Тестирование функциональности покупки Pro плана</p>
        </div>

        {/* Quick Buy Pro Button */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Быстрая покупка Pro</h2>
          <BuyProButton className="w-full" />
        </div>

        {/* Subscription Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Информация о подписке</h2>
          <SubscriptionInfo />
        </div>

        {/* Detailed Test Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Подробное тестирование</h2>
          <LemonSqueezyTest />
        </div>
      </div>
    </div>
  );
}
