// Test script for NextAuth URL configuration
require('dotenv').config()

console.log('🔐 Testing NextAuth URL configuration...\n')

// Test environment variables
console.log('1. Environment Variables:')
console.log('   NODE_ENV:', process.env.NODE_ENV)
console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('   NEXTAUTH_NGROK_URL:', process.env.NEXTAUTH_NGROK_URL)
console.log()

// Test URL logic
console.log('2. URL Logic Testing:')
const isDevelopment = process.env.NODE_ENV === 'development'
const hasNgrokUrl = !!process.env.NEXTAUTH_NGROK_URL
const ngrokUrl = process.env.NEXTAUTH_NGROK_URL

console.log('   Is Development:', isDevelopment)
console.log('   Has Ngrok URL:', hasNgrokUrl)
console.log('   Ngrok URL:', ngrokUrl)
console.log()

// Test redirect scenarios
console.log('3. Redirect Scenarios:')
if (isDevelopment && hasNgrokUrl) {
  const scenarios = [
    { url: '/studio', baseUrl: 'http://localhost:3000' },
    { url: 'http://localhost:3000/studio', baseUrl: 'http://localhost:3000' },
    { url: '/', baseUrl: 'http://localhost:3000' },
    { url: 'https://example.com', baseUrl: 'http://localhost:3000' }
  ]
  
  scenarios.forEach(({ url, baseUrl }) => {
    let result = url
    
    if (url.startsWith('http://localhost:3000')) {
      result = url.replace('http://localhost:3000', ngrokUrl)
    } else if (url.startsWith('/')) {
      result = `${ngrokUrl}${url}`
    }
    
    console.log(`   ${url} (base: ${baseUrl}) → ${result}`)
  })
} else {
  console.log('   Skipping redirect scenarios (not in development or no ngrok URL)')
}
console.log()

// Test Google OAuth callback URLs
console.log('4. Google OAuth Callback URLs:')
if (hasNgrokUrl) {
  const callbackUrls = [
    `${ngrokUrl}/api/auth/callback/google`,
    `${ngrokUrl}/api/auth/signin`,
    `${ngrokUrl}/api/auth/signout`
  ]
  
  callbackUrls.forEach(url => {
    console.log(`   ✅ ${url}`)
  })
} else {
  console.log('   ❌ No ngrok URL configured')
}
console.log()

console.log('✅ Testing complete!')
console.log('\n📝 Next steps:')
console.log('   1. Make sure NEXTAUTH_NGROK_URL is set in .env')
console.log('   2. Update Google OAuth Console with ngrok callback URLs')
console.log('   3. Test authentication flow in browser')

