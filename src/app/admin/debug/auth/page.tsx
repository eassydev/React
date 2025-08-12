'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthDebugPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    const token = localStorage.getItem('adminToken');
    
    const info = {
      exists: !!token,
      length: token?.length || 0,
      preview: token ? token.substring(0, 50) + '...' : 'No token',
      isValidFormat: false,
      parts: 0
    };

    if (token) {
      const parts = token.split('.');
      info.parts = parts.length;
      info.isValidFormat = parts.length === 3;
    }

    setTokenInfo(info);
  };

  const testAuthentication = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setTestResult({
          success: false,
          message: 'No token found in localStorage',
          action: 'Please login first'
        });
        return;
      }

      const response = await fetch('/admin-api/b2b/orders', {
        method: 'GET',
        headers: {
          'admin-auth-token': token
        }
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Authentication successful!',
          status: response.status
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
          action: response.status === 401 ? 'Please login again' : 'Check server logs'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Network error',
        action: 'Check if backend is running'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('adminToken');
    checkToken();
    setTestResult(null);
  };

  const goToLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Authentication Debug</h1>
          <p className="text-gray-600">Debug admin authentication issues</p>
        </div>
        <Button onClick={checkToken} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Token Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Token Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokenInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Token Exists:</span>
                <Badge variant={tokenInfo.exists ? 'default' : 'destructive'}>
                  {tokenInfo.exists ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Token Length:</span>
                <Badge variant="outline">{tokenInfo.length} characters</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Valid JWT Format:</span>
                <Badge variant={tokenInfo.isValidFormat ? 'default' : 'destructive'}>
                  {tokenInfo.isValidFormat ? 'Yes' : 'No'} ({tokenInfo.parts} parts)
                </Badge>
              </div>
              
              <div>
                <span className="font-medium">Token Preview:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                  {tokenInfo.preview}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Authentication Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testAuthentication} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing Authentication...
                </>
              ) : (
                'Test Authentication'
              )}
            </Button>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.message}
                  </span>
                </div>
                
                {testResult.status && (
                  <div className="mt-2 text-sm text-gray-600">
                    HTTP Status: {testResult.status}
                  </div>
                )}
                
                {testResult.action && (
                  <div className="mt-2 text-sm font-medium text-blue-600">
                    Action: {testResult.action}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={goToLogin} variant="default">
              Go to Login
            </Button>
            <Button onClick={clearToken} variant="destructive">
              Clear Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>If token doesn't exist or is invalid format, click "Go to Login" and login again</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>If authentication test fails with 401, your token may be expired - login again</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>If authentication test fails with network error, check if backend is running on port 5001</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>After successful authentication, try generating an invoice again</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
