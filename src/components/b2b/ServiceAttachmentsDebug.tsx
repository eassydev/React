'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, Play } from 'lucide-react';
import { fetchB2BBookingAttachments } from '@/lib/api';

/**
 * Debug component to test service attachments API
 * This helps identify the exact structure being returned by the API
 */
export const ServiceAttachmentsDebug: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    if (!bookingId.trim()) {
      setError('Please enter a booking ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing API with booking ID:', bookingId);
      
      const response = await fetchB2BBookingAttachments(bookingId.trim());
      
      console.log('🧪 API Response:', response);
      console.log('🧪 Response type:', typeof response);
      console.log('🧪 Response.data:', response.data);
      console.log('🧪 Response.data.attachments:', response.data?.attachments);
      console.log('🧪 Is attachments array?', Array.isArray(response.data?.attachments));
      
      setResult(response);
      
    } catch (err: any) {
      console.error('🧪 API Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Service Attachments API Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID to test"
            />
          </div>
          <Button 
            onClick={testAPI} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Testing...' : 'Test API'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>API Response Structure:</strong>
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Response Analysis:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Success:</strong> {String(result.success)}
                </div>
                <div>
                  <strong>Has Data:</strong> {String(!!result.data)}
                </div>
                <div>
                  <strong>Has Attachments:</strong> {String(!!result.data?.attachments)}
                </div>
                <div>
                  <strong>Attachments Type:</strong> {typeof result.data?.attachments}
                </div>
                <div>
                  <strong>Is Array:</strong> {String(Array.isArray(result.data?.attachments))}
                </div>
                <div>
                  <strong>Attachments Length:</strong> {Array.isArray(result.data?.attachments) ? result.data.attachments.length : 'N/A'}
                </div>
                <div>
                  <strong>Total:</strong> {result.data?.total || 'N/A'}
                </div>
                <div>
                  <strong>Message:</strong> {result.message || 'None'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Raw Response:</h4>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded border">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {Array.isArray(result.data?.attachments) && result.data.attachments.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Sample Attachment:</h4>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded border">
                  {JSON.stringify(result.data.attachments[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Enter a valid booking ID that has service attachments</li>
              <li>Click "Test API" to see the exact response structure</li>
              <li>Check the console for detailed logs</li>
              <li>Use this information to debug the ServiceAttachments component</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
