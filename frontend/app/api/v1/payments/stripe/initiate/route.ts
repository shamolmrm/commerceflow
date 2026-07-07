import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({
    client_secret: 'pi_demo_' + Date.now() + '_secret_demo',
    payment_intent_id: 'pi_demo_' + Date.now(),
  })
}
