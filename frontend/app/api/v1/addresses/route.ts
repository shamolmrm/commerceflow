import { NextResponse } from 'next/server'

const mockAddresses = [
  {
    id: 1,
    address_line1: '123 Main Street',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US',
    is_default: true,
    phone: '+1-555-0101',
  },
  {
    id: 2,
    address_line1: '456 Oak Avenue',
    address_line2: '',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90001',
    country: 'US',
    is_default: false,
    phone: '+1-555-0102',
  },
]

export async function GET() {
  return NextResponse.json(mockAddresses)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newAddress = { id: Date.now(), is_default: false, ...body }
  return NextResponse.json(newAddress, { status: 201 })
}
