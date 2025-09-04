// Test script for middleware functionality
require('dotenv').config()

console.log('🔄 Testing middleware functionality...\n')

// Simulate middleware logic
function simulateMiddleware(host, url) {
  console.log(`Host: ${host}`)
  console.log(`URL: ${url}`)
  
  // Check if we're on ngrok
  if (host && host.includes('ngrok') && process.env.NEXTAUTH_NGROK_URL) {
    const ngrokUrl = process.env.NEXTAUTH_NGROK_URL
    
    // Check if the URL contains localhost and replace it
    if (url.includes('localhost:3000')) {
      const fixedUrl = url.replace('http://localhost:3000', ngrokUrl)
      console.log(`✅ Fixed localhost URL: ${fixedUrl}`)
      return fixedUrl
    }
    
    // Check if we're trying to redirect to root and force ngrok
    if (url.includes('/') && url.includes('callbackUrl=localhost:3000')) {
      const fixedUrl = url.replace('localhost:3000', ngrokUrl.replace('https://', ''))
      console.log(`✅ Fixed callback URL: ${fixedUrl}`)
      return fixedUrl
    }
  }
  
  console.log('ℹ️  No changes needed')
  return url
}

// Test scenarios
console.log('1. Testing localhost scenario:')
simulateMiddleware('localhost:3000', 'http://localhost:3000/studio')
console.log()

console.log('2. Testing ngrok scenario:')
simulateMiddleware('abbcfd0cdc8e.ngrok-free.app', 'http://localhost:3000/studio')
console.log()

console.log('3. Testing ngrok with callback URL:')
simulateMiddleware('abbcfd0cdc8e.ngrok-free.app', 'https://abbcfd0cdc8e.ngrok-free.app/?callbackUrl=http://localhost:3000/studio')
console.log()

console.log('4. Testing ngrok with relative URL:')
simulateMiddleware('abbcfd0cdc8e.ngrok-free.app', '/studio')
console.log()

console.log('✅ Middleware testing complete!')
console.log('\n📝 Note: This simulates the middleware logic. Actual behavior may differ.')

