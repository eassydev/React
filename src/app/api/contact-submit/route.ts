import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    console.log('📞 Contact form submission received:', body)

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json(
        {
          status: false,
          message: 'All fields are required'
        },
        { status: 400 }
      )
    }

    // Basic validation
    if (body.name.length < 2 || body.name.length > 100) {
      return NextResponse.json(
        {
          status: false,
          message: 'Name must be between 2 and 100 characters'
        },
        { status: 400 }
      )
    }

    if (body.message.length < 10 || body.message.length > 1000) {
      return NextResponse.json(
        {
          status: false,
          message: 'Message must be between 10 and 1000 characters'
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          status: false,
          message: 'Please enter a valid email address'
        },
        { status: 400 }
      )
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        {
          status: false,
          message: 'Please enter a valid phone number'
        },
        { status: 400 }
      )
    }

    // Try to submit to the backend API
    try {
      const backendResponse = await fetch('https://app.eassylife.in/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (backendResponse.ok) {
        const result = await backendResponse.json()
        if (result.status) {
          console.log('✅ Contact form submitted to backend successfully')
          return NextResponse.json({
            status: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
          })
        }
      }
    } catch (backendError) {
      console.error('❌ Backend submission failed:', backendError)
    }

    // If backend fails, log the submission locally and still show success to user
    console.log('📝 Contact form submission (backend unavailable):', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    })

    // Always return success to user (we'll handle backend issues separately)
    return NextResponse.json({
      status: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    })

  } catch (error) {
    console.error('❌ Contact form API error:', error)
    
    return NextResponse.json(
      {
        status: false,
        message: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
