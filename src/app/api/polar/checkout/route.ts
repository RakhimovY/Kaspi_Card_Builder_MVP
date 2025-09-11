import { Checkout } from '@polar-sh/nextjs'
import { env } from '@/lib/server/env'

// Polar official Next.js adapter: GET route with products query (?products=<productId>)
export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN,
})
