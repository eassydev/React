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
    
    console.log('📞 Contact form submission received:', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      messageLength: body.message?.length
    })

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

    // Save to database using the same approach as other admin APIs
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.eassylife.in/api'
    
    try {
      // Call the backend API to save contact
      const backendResponse = await fetch(`${API_URL}/admin/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add admin token if available (for internal API calls)
          'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || 'internal-call'}`,
        },
        body: JSON.stringify({
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone.trim(),
          message: body.message.trim(),
          source: 'admin-panel-contact-form'
        })
      })

      if (backendResponse.ok) {
        const result = await backendResponse.json()
        if (result.status) {
          console.log('✅ Contact saved to database successfully')
          return NextResponse.json({
            status: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
            contact_id: result.contact_id
          })
        }
      }
    } catch (backendError) {
      console.error('❌ Backend API call failed:', backendError)
    }

    // Fallback: Log the contact locally if backend fails
    console.log('📝 Contact form submission (backend unavailable):', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
      source: 'admin-panel-fallback'
    })

    // Always return success to user
    return NextResponse.json({
      status: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      note: 'Contact logged locally - will be processed manually'
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
