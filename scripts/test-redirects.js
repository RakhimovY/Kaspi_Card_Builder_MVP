// Test script for ngrok redirect utilities
require('dotenv').config()

console.log('🧪 Testing ngrok redirect utilities...\n')

// Since we can't import ES modules directly in CommonJS, let's test the logic manually
console.log('1. Testing environment variables:')
console.log('   NODE_ENV:', process.env.NODE_ENV)
console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('   NEXTAUTH_NGROK_URL:', process.env.NEXTAUTH_NGROK_URL)
console.log()

// Test 2: Manual logic testing
console.log('2. Testing manual logic:')
const isDevelopment = process.env.NODE_ENV === 'development'
const hasNgrokUrl = !!process.env.NEXTAUTH_NGROK_URL
const ngrokUrl = process.env.NEXTAUTH_NGROK_URL

console.log('   Is Development:', isDevelopment)
console.log('   Has Ngrok URL:', hasNgrokUrl)
console.log('   Ngrok URL:', ngrokUrl)
console.log()

// Test 3: URL transformation logic
console.log('3. Testing URL transformation logic:')
if (isDevelopment && hasNgrokUrl) {
  const testUrls = [
    '/studio',
    'http://localhost:3000/studio',
    'https://example.com'
  ]
  
  testUrls.forEach(url => {
    let transformed = url
    if (url.includes('localhost:3000')) {
      transformed = url.replace('http://localhost:3000', ngrokUrl)
    } else if (url.startsWith('/')) {
      transformed = `${ngrokUrl}${url}`
    }
    console.log(`   ${url} → ${transformed}`)
  })
} else {
  console.log('   Skipping URL transformation (not in development or no ngrok URL)')
}
console.log()

console.log('✅ Testing complete!')
console.log('\n📝 Note: To test the actual utilities, run the app and check the console logs')
console.log('\n🔧 To set environment variables, create a .env file with:')
console.log('   NEXTAUTH_NGROK_URL="https://abbcfd0cdc8e.ngrok-free.app"')
console.log('   NODE_ENV="development"')
