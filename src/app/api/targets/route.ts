import { NextRequest, NextResponse } from 'next/server';

/**
 * Backend Proxy for External Targets API
 * 
 * This route proxies requests to the external targets API, keeping the API key
 * secure on the server-side instead of exposing it in the browser.
 */

// Get API configuration from environment (server-side only)
const API_BASE_URL = process.env.TARGETS_API_URL || 'https://eassylifejsr.vercel.app';
const API_KEY = process.env.TARGETS_API_KEY || '';

export async function GET(request: NextRequest) {
    // Verify API key is configured
    if (!API_KEY) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'CONFIG_ERROR',
                    message: 'API key not configured on server',
                },
            },
            { status: 500 }
        );
    }

    try {
        // Extract query parameters from the request
        const searchParams = request.nextUrl.searchParams;

        // Build query string for external API
        const queryParams = new URLSearchParams();

        // Forward all query parameters
        searchParams.forEach((value, key) => {
            queryParams.append(key, value);
        });

        // Make request to external API with API key
        const externalUrl = `${API_BASE_URL}/api/external/targets-listing?${queryParams.toString()}`;

        const response = await fetch(externalUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
                'X-Client-ID': 'eassy-admin-panel',
            },
            cache: 'no-store',
        });

        // Get response data
        const data = await response.json();

        // Forward the response status and data
        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (error) {
        console.error('❌ Proxy API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROXY_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch data',
                },
            },
            { status: 500 }
        );
    }
}
