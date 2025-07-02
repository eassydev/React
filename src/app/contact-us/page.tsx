"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, User, Send, Mail, Phone } from "lucide-react"

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 2 characters long",
        variant: "destructive"
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return false
    }

    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      })
      return false
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      toast({
        title: "Validation Error",
        description: "Message must be at least 10 characters long",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Submit directly to backend API
      console.log('📞 Submitting contact form to backend...')

      const response = await fetch('https://app.eassylife.in/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.status) {
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for contacting us! We will get back to you soon.",
        })

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        })
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || 'Failed to submit contact form. Please try again.',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: "Network Error",
        description: "Please check your connection and try again, or contact us directly at support@eassylife.in",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 md:text-xl">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        {/* Contact Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6 text-orange-500" />
              Send us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    maxLength={20}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    maxLength={1000}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="text-right text-sm text-gray-500">
                    {formData.message.length}/1000
                  </div>
                </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Simple Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Eassy Life. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
