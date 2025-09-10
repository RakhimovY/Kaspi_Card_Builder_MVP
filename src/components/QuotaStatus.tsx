'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/useTranslations';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Globe, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface QuotaInfo {
  isAuthenticated: boolean;
  current: number;
  limit: number;
  feature: string;
}

interface QuotaStatusProps {
  feature?: 'magicFill' | 'photos' | 'export';
  className?: string;
}

export default function QuotaStatus({ feature = 'magicFill', className }: QuotaStatusProps) {
  const { t } = useTranslations();
  const { data: session } = useSession();
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuotaInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quota?feature=${feature}`);
      if (response.ok) {
        const data = await response.json();
        setQuotaInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch quota info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaInfo();
  }, [feature, session?.user?.id]);

  if (!quotaInfo) {
    return null;
  }

  const { isAuthenticated, current, limit } = quotaInfo;
  const remaining = limit - current;
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  const getStatusColor = () => {
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (isAtLimit) return <AlertCircle className="w-4 h-4" />;
    if (isNearLimit) return <Info className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isAtLimit) {
      return isAuthenticated 
        ? 'Лимит исчерпан. Обновите подписку.'
        : 'Лимит исчерпан. Зарегистрируйтесь для увеличения лимита.';
    }
    if (isNearLimit) {
      return isAuthenticated
        ? 'Лимит почти исчерпан'
        : 'Лимит почти исчерпан. Зарегистрируйтесь для увеличения лимита.';
    }
    return isAuthenticated
      ? 'Лимит в порядке'
      : 'Анонимное использование';
  };

  const getFeatureName = () => {
    switch (feature) {
      case 'magicFill': return 'Magic Fill';
      case 'photos': return 'Обработка фото';
      case 'export': return 'Экспорт';
      default: return 'Использование';
    }
  };

  return (
    <Card className={`${className} ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <User className="w-4 h-4 text-blue-600" />
            ) : (
              <Globe className="w-4 h-4 text-gray-600" />
            )}
            <span className="font-medium text-sm">
              {getFeatureName()}
            </span>
          </div>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Использовано:</span>
            <span className="font-medium">
              {current} / {limit}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="text-xs text-gray-600">
            {remaining > 0 ? (
              <>Осталось: {remaining} попыток</>
            ) : (
              <>Лимит исчерпан</>
            )}
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-gray-200">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  // Redirect to sign in
                  window.location.href = '/auth/signin';
                }}
              >
                <User className="w-3 h-3 mr-1" />
                Зарегистрироваться для увеличения лимита
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
