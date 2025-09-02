/**
 * Утилиты для работы с аутентификацией
 */

/**
 * Полная очистка клиентских данных аутентификации
 */
export function clearAuthData() {
  try {
    // Очищаем localStorage от пользовательских данных
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('next-auth') ||
        key.startsWith('auth') ||
        key.startsWith('user') ||
        key.startsWith('session') ||
        key.startsWith('token')
      )) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Очищаем sessionStorage
    sessionStorage.clear()
    
    // Очищаем cookies (если есть)
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      if (name.trim().startsWith('next-auth') || name.trim().startsWith('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })

    // Очищаем IndexedDB (если доступен)
    if ('indexedDB' in window) {
      try {
        const request = indexedDB.deleteDatabase('next-auth')
        request.onsuccess = () => console.log('IndexedDB cleared')
        request.onerror = () => console.log('IndexedDB clear failed')
      } catch (e) {
        console.log('IndexedDB not available')
      }
    }

    // Очищаем кэш браузера для аутентификации
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('auth') || cacheName.includes('next-auth')) {
            caches.delete(cacheName)
          }
        })
      })
    }
    
    console.log('Auth data cleared successfully')
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

/**
 * Проверка, есть ли активная сессия
 */
export function hasActiveSession(): boolean {
  try {
    // Проверяем различные источники данных о сессии
    const hasNextAuthSession = localStorage.getItem('next-auth.session-token') !== null
    const hasSessionStorage = sessionStorage.getItem('next-auth.session-token') !== null
    
    return hasNextAuthSession || hasSessionStorage
  } catch {
    return false
  }
}
