'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Phone, MessageCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Extract payment details from URL parameters
    const details = {
      razorpay_payment_id: searchParams.get('razorpay_payment_id'),
      razorpay_payment_link_id: searchParams.get('razorpay_payment_link_id'),
      razorpay_payment_link_reference_id: searchParams.get('razorpay_payment_link_reference_id'),
      razorpay_payment_link_status: searchParams.get('razorpay_payment_link_status'),
      razorpay_signature: searchParams.get('razorpay_signature'),
      source: searchParams.get('source'),
      booking_id: searchParams.get('booking_id'),
    };

    setPaymentDetails(details);
  }, [searchParams]);

  const handleCallSupport = () => {
    window.location.href = 'tel:+917042717777';
  };

  const handleWhatsAppSupport = () => {
    window.location.href =
      'https://wa.me/917042717777?text=Hi, I need help with my booking payment';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        </div>

        <div className="space-y-6">
          <div className="text-center text-gray-700">
            <p className="text-lg mb-2">Thank you for your payment!</p>
            <p className="text-sm">
              Your booking has been confirmed and you will receive a confirmation message shortly.
            </p>
          </div>

          {paymentDetails && paymentDetails.razorpay_payment_id && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 text-center">
                Payment Confirmation
              </h3>
              <div className="text-sm text-center">
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <div className="mt-1 font-mono text-xs bg-white px-3 py-2 rounded border break-all">
                  {paymentDetails.razorpay_payment_id}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 text-center">What's Next?</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• You will receive a WhatsApp confirmation message</li>
              <li>• Our team will contact you to schedule the service</li>
              <li>• Check your mobile app for booking updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCallSupport}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </button>

            <button
              onClick={handleWhatsAppSupport}
              className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp Support
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium">Need Help?</p>
            <p>Contact our support team for any assistance with your booking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
